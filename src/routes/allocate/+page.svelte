<script lang="ts">
  import PrivacyNotice from '$lib/components/PrivacyNotice.svelte';
  import { runAllocation } from '$lib/allocation/allocate.ts';
  import { createRunManifest } from '$lib/allocation/manifest.ts';
  import { createRandomSeed } from '$lib/allocation/priority.ts';
  import { allocationMetrics, buildClubSummaries } from '$lib/allocation/summary.ts';
  import {
    ALGORITHM_VERSION,
    type AllocationRunInput,
    type AllocationRunResult,
    type ClubSummary,
    type RunManifest
  } from '$lib/allocation/types.ts';
  import { validateCapacityImport } from '$lib/capacities/import.ts';
  import { buildResultFiles, createResultZip, resultArchiveName } from '$lib/csv/export.ts';
  import { clubComparisonKey } from '$lib/csv/normalise.ts';
  import { parseApplicationCsv, parseCapacityText } from '$lib/csv/parse.ts';
  import {
    resolveClubNames,
    validateApplications,
    type ValidationResult
  } from '$lib/csv/validate.ts';

  let applicationFileInput: HTMLInputElement;
  let capacityFileInput: HTMLInputElement;
  let seedInput: HTMLInputElement;
  let fileName = '';
  let fileSize = 0;
  let rawCsv = '';
  let validation: ValidationResult | null = null;
  let resolutions: Record<string, string> = {};
  let capacities: Record<string, string> = {};
  let uniformCapacity = '';
  let capacityText = '';
  let capacityImportErrors: string[] = [];
  let warningsReviewed = false;
  let seed = createRandomSeed();
  let result: AllocationRunResult | null = null;
  let resultInput: AllocationRunInput | null = null;
  let summaries: ClubSummary[] = [];
  let manifest: RunManifest | null = null;
  let archive: Uint8Array | null = null;
  let archiveName = '';
  let resultsStale = false;
  let running = false;
  let liveMessage = '';

  $: errors = validation?.issues.filter((issue) => issue.severity === 'error') ?? [];
  $: warnings = validation?.issues.filter((issue) => issue.severity === 'warning') ?? [];
  $: unresolvedConflicts = validation?.conflicts.filter((conflict) => !resolutions[conflict.key]) ?? [];
  $: resolvedApplications = validation ? resolveClubNames(validation.applications, resolutions) : [];
  $: resolvedClubs = [...new Set(resolvedApplications.flatMap((application) => application.choices))].sort();
  $: capacitiesComplete = resolvedClubs.length > 0 && resolvedClubs.every((club) => {
    const value = capacities[club];
    return /^\d+$/u.test(value ?? '') && Number.isSafeInteger(Number(value));
  });
  $: canRun = !!validation && errors.length === 0 && unresolvedConflicts.length === 0 &&
    capacitiesComplete && (warnings.length === 0 || warningsReviewed) && seed.trim().length > 0 && !running;
  $: choiceCounts = [1, 2, 3].map((count) =>
    validation?.applications.filter((application) => application.choices.length === count).length ?? 0
  );
  $: uniqueClubCount = validation
    ? new Set(validation.applications.flatMap((application) => application.choices.map(clubComparisonKey))).size
    : 0;
  $: totalCapacity = resolvedClubs.reduce((sum, club) => sum + (Number(capacities[club]) || 0), 0);
  $: metrics = result && resultInput ? allocationMetrics(resultInput, result) : null;

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function invalidateResult(): void {
    if (result) resultsStale = true;
  }

  async function loadApplicationFile(event: Event): Promise<void> {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    clearRunData();
    fileName = file.name;
    fileSize = file.size;
    rawCsv = await file.text();
    validation = validateApplications(parseApplicationCsv(rawCsv));
    resolutions = {};
    capacities = {};
    warningsReviewed = false;
    liveMessage = `Validation finished. ${validation.applications.length} valid applications and ${errors.length} errors.`;
  }

  function setResolution(key: string, value: string): void {
    resolutions = { ...resolutions, [key]: value };
    capacities = {};
    invalidateResult();
  }

  function setCapacity(club: string, value: string): void {
    capacities = { ...capacities, [club]: value };
    invalidateResult();
  }

  function setAllCapacities(): void {
    if (!/^\d+$/u.test(uniformCapacity)) return;
    capacities = Object.fromEntries(resolvedClubs.map((club) => [club, uniformCapacity]));
    invalidateResult();
  }

  function clearCapacities(): void {
    capacities = {};
    uniformCapacity = '';
    invalidateResult();
  }

  function applyCapacitySource(source: string): void {
    const parsed = parseCapacityText(source);
    const checked = validateCapacityImport(parsed.rows, resolvedClubs);
    capacityImportErrors = [...parsed.errors, ...checked.errors];
    if (capacityImportErrors.length === 0) {
      capacities = { ...capacities, ...Object.fromEntries(Object.entries(checked.values).map(([club, value]) => [club, String(value)])) };
      invalidateResult();
    }
  }

  async function loadCapacityFile(event: Event): Promise<void> {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    applyCapacitySource(await file.text());
  }

  function generateSeed(): void {
    seed = createRandomSeed();
    invalidateResult();
  }

  async function copySeed(): Promise<void> {
    try {
      await navigator.clipboard.writeText(seed);
      liveMessage = 'Seed copied.';
    } catch {
      seedInput.select();
      liveMessage = 'Seed selected. Copy it using your browser command.';
    }
  }

  async function runLottery(): Promise<void> {
    if (!canRun) return;
    running = true;
    liveMessage = 'Running the lottery.';
    try {
      const input: AllocationRunInput = {
        applications: resolvedApplications,
        capacities: Object.fromEntries(resolvedClubs.map((club) => [club, Number(capacities[club])])),
        seed: seed.trim(),
        algorithmVersion: ALGORITHM_VERSION
      };
      const runTimestamp = new Date().toISOString();
      const nextResult = await runAllocation(input);
      const nextSummaries = buildClubSummaries(input, nextResult);
      const nextManifest = await createRunManifest({
        input,
        inputCsv: rawCsv,
        runTimestamp,
        warnings: warnings.map((warning) => warning.message)
      });
      const files = buildResultFiles(input, nextResult, nextSummaries, nextManifest);
      resultInput = input;
      result = nextResult;
      summaries = nextSummaries;
      manifest = nextManifest;
      archive = createResultZip(files);
      archiveName = resultArchiveName(runTimestamp, input.seed);
      resultsStale = false;
      liveMessage = `Allocation finished. ${allocationMetrics(input, nextResult).totalAllocated} tickets allocated.`;
      requestAnimationFrame(() => document.querySelector<HTMLElement>('#results-heading')?.focus());
    } finally {
      running = false;
    }
  }

  function downloadArchive(): void {
    if (!archive) return;
    const url = URL.createObjectURL(new Blob([archive as BlobPart], { type: 'application/zip' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = archiveName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function clearRunData(): void {
    result = null;
    resultInput = null;
    summaries = [];
    manifest = null;
    archive = null;
    archiveName = '';
    resultsStale = false;
  }

  function clearAll(): void {
    fileName = '';
    fileSize = 0;
    rawCsv = '';
    validation = null;
    resolutions = {};
    capacities = {};
    uniformCapacity = '';
    capacityText = '';
    capacityImportErrors = [];
    warningsReviewed = false;
    seed = createRandomSeed();
    clearRunData();
    if (applicationFileInput) applicationFileInput.value = '';
    if (capacityFileInput) capacityFileInput.value = '';
    liveMessage = 'All uploaded and generated data has been cleared from memory.';
  }
</script>

<svelte:head><title>Allocate club places | Clubstonbury</title></svelte:head>

<main id="main" class="tool-main">
  <section class="tool-intro">
    <div class="page-width">
      <p class="eyebrow">The allocation tent</p>
      <h1>Allocate club places</h1>
      <p class="strapline">Fairness without Stress</p>
      <p>Load the applications, set each club’s capacity and run a reproducible three-round lottery entirely on this device.</p>
    </div>
  </section>

  <div class="tool-wrap">
    <nav class="workflow-steps" aria-label="Allocation steps">
      <a href="#upload"><span>1</span> Upload</a><a href="#validate"><span>2</span> Validate</a>
      <a href="#capacities"><span>3</span> Capacities</a><a href="#review"><span>4</span> Review</a>
      <a href="#results"><span>5</span> Results</a><a href="#download"><span>6</span> Download</a>
    </nav>

    <PrivacyNotice compact />
    <p class="sr-status" aria-live="polite">{liveMessage}</p>

    <section class="panel" id="upload" aria-labelledby="upload-heading">
      <div class="panel-head"><span class="panel-number">1</span><div><h2 id="upload-heading">Upload applications</h2><p>Select the exported application CSV. It is read into memory, never uploaded.</p></div></div>
      <div class="dropzone">
        <label class="field-label" for="application-file">Application CSV</label><br />
        <input bind:this={applicationFileInput} id="application-file" data-testid="application-file" type="file" accept=".csv,text/csv" on:change={loadApplicationFile} />
      </div>
      {#if fileName}<div class="file-meta"><span><strong>File</strong>{fileName}</span><span><strong>Size</strong>{formatBytes(fileSize)}</span></div>{/if}
    </section>

    <section class="panel" id="validate" aria-labelledby="validate-heading">
      <div class="panel-head"><span class="panel-number">2</span><div><h2 id="validate-heading">Validate applications</h2><p>Errors must be corrected in the source file. Warnings require review.</p></div></div>
      {#if !validation}
        <p class="notice">Upload an application CSV to begin validation.</p>
      {:else}
        <div class="stats-grid" aria-label="Validation summary">
          <div class="stat"><strong>{validation.rowCount}</strong><span>data rows</span></div>
          <div class="stat green"><strong>{validation.applications.length}</strong><span>valid applications</span></div>
          <div class="stat red"><strong>{errors.length}</strong><span>invalid rows or file errors</span></div>
          <div class="stat yellow"><strong>{uniqueClubCount}</strong><span>unique clubs</span></div>
          <div class="stat"><strong>{choiceCounts[0]}</strong><span>with one choice</span></div>
          <div class="stat"><strong>{choiceCounts[1]}</strong><span>with two choices</span></div>
          <div class="stat"><strong>{choiceCounts[2]}</strong><span>with three choices</span></div>
        </div>
        {#if errors.length}
          <div class="error-box" role="alert"><strong>Correct {errors.length} {errors.length === 1 ? 'error' : 'errors'} before continuing.</strong><ul class="issue-list">{#each errors as issue}<li>{issue.row ? `Row ${issue.row}: ` : ''}{issue.message}{#if issue.childId} <small>Child ID: {issue.childId}</small>{/if}{#if issue.correction}<small>{issue.correction}</small>{/if}</li>{/each}</ul></div>
        {:else}<p class="success-box"><strong>Validation passed.</strong> All application rows are valid.</p>{/if}
        {#if warnings.length}
          <div class="notice"><strong>Review {warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'}.</strong><ul class="issue-list">{#each warnings as warning}<li>{warning.message}{#if warning.correction}<small>{warning.correction}</small>{/if}</li>{/each}</ul>
            <label class="checkbox-row"><input type="checkbox" bind:checked={warningsReviewed} on:change={invalidateResult} /><span>I have reviewed and accept these warnings.</span></label>
          </div>
        {/if}
        {#if validation.conflicts.length}
          <div class="notice"><strong>Resolve likely duplicate club names.</strong><p>Choose the one display name to use for each group. Clubstonbury will not merge them without your decision.</p>
            {#each validation.conflicts as conflict}
              <div class="field"><label for={`resolve-${conflict.key}`}>{conflict.variants.join(' / ')}</label><select id={`resolve-${conflict.key}`} value={resolutions[conflict.key] ?? ''} on:change={(event) => setResolution(conflict.key, event.currentTarget.value)}><option value="">Choose a display name</option>{#each conflict.variants as variant}<option value={variant.trim().replace(/\s+/gu, ' ')}>{variant.trim().replace(/\s+/gu, ' ')}</option>{/each}</select></div>
            {/each}
          </div>
        {/if}
        {#if validation.applications.length}
          <h3>Application preview</h3><div class="table-wrap"><table class="preview-table"><thead><tr><th>Row</th><th>ID</th><th>Timestamp</th><th>First</th><th>Second</th><th>Third</th></tr></thead><tbody>{#each validation.applications.slice(0, 6) as application}<tr><td>{application.sourceRow}</td><td>{application.id}</td><td>{application.timestamp}</td><td>{application.choices[0]}</td><td>{application.choices[1] ?? ''}</td><td>{application.choices[2] ?? ''}</td></tr>{/each}</tbody></table></div>
        {/if}
        <p class="notice"><strong>Eligibility assumption:</strong> uploaded choices must already have been checked for year and other eligibility rules. Clubstonbury never infers eligibility from an ID.</p>
      {/if}
    </section>

    <section class="panel" id="capacities" aria-labelledby="capacities-heading">
      <div class="panel-head"><span class="panel-number">3</span><div><h2 id="capacities-heading">Set club capacities</h2><p>Enter each capacity, or import a separate two-column club and capacity file.</p></div></div>
      {#if !validation || errors.length || unresolvedConflicts.length}
        <p class="notice">Complete validation and club-name review before setting capacities.</p>
      {:else}
        <div class="table-wrap"><table class="capacity-table"><thead><tr><th>Club</th><th class="numeric">Applications</th><th class="numeric">First choices</th><th>Capacity</th></tr></thead><tbody>
          {#each resolvedClubs as club}
            <tr><td data-label="Club"><strong>{club}</strong></td><td data-label="Applications" class="numeric">{resolvedApplications.filter((application) => application.choices.includes(club)).length}</td><td data-label="First choices" class="numeric">{resolvedApplications.filter((application) => application.choices[0] === club).length}</td><td data-label="Capacity"><label class="sr-status" for={`capacity-${club}`}>Capacity for {club}</label><input class="capacity" id={`capacity-${club}`} data-testid="capacity-input" type="number" min="0" step="1" inputmode="numeric" value={capacities[club] ?? ''} on:input={(event) => setCapacity(club, event.currentTarget.value)} /></td></tr>
          {/each}
        </tbody></table></div>
        <div class="controls"><label for="uniform-capacity"><strong>Set every club to</strong></label><input id="uniform-capacity" type="number" min="0" step="1" bind:value={uniformCapacity} /><button class="button" type="button" on:click={setAllCapacities}>Apply to all</button><button class="button danger" type="button" on:click={clearCapacities}>Clear capacities</button></div>
        <div class="capacity-actions">
          <div class="field"><label for="capacity-file">Upload capacity CSV or TSV</label><input bind:this={capacityFileInput} id="capacity-file" type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" on:change={loadCapacityFile} /><small>Use exactly two columns: <code>club,capacity</code>. A header row is optional.</small></div>
          <div class="field"><label for="capacity-paste">Or paste club and capacity</label><textarea id="capacity-paste" bind:value={capacityText} placeholder={'Football\t20\nDrama\t16\nCoding\t12'}></textarea><button class="button" type="button" on:click={() => applyCapacitySource(capacityText)}>Apply pasted list</button></div>
        </div>
        {#if capacityImportErrors.length}<div class="error-box" role="alert"><strong>The capacity import was not applied.</strong><ul class="issue-list">{#each capacityImportErrors as error}<li>{error}</li>{/each}</ul></div>{/if}
        {#if capacitiesComplete}<p class="success-box"><strong>All capacities are ready.</strong> {totalCapacity} tickets are available across {resolvedClubs.length} clubs.</p>{/if}
      {/if}
    </section>

    <section class="panel" id="review" aria-labelledby="review-heading">
      <div class="panel-head"><span class="panel-number">4</span><div><h2 id="review-heading">Review lottery settings</h2><p>These values, together with the source CSV, reproduce the result.</p></div></div>
      <div class="field"><label for="seed">Random seed</label><div class="seed-row"><input bind:this={seedInput} id="seed" data-testid="seed-input" value={seed} on:input={(event) => { seed = event.currentTarget.value; invalidateResult(); }} /><button class="button" type="button" on:click={copySeed} aria-label="Copy random seed">Copy seed</button><button class="button secondary" type="button" on:click={generateSeed}>New seed</button></div><small>Generated with browser cryptography. The same seed and inputs always give the same result.</small></div>
      <div class="review-grid">
        <div class="review-item"><span>Valid applications</span><strong>{validation?.applications.length ?? 0}</strong></div>
        <div class="review-item"><span>Clubs</span><strong>{resolvedClubs.length}</strong></div>
        <div class="review-item"><span>Available tickets</span><strong>{totalCapacity}</strong></div>
        <div class="review-item"><span>Algorithm</span><strong>{ALGORITHM_VERSION}</strong></div>
        <div class="review-item"><span>Timestamps rank entries?</span><strong>No</strong></div>
        <div class="review-item"><span>Processing location</span><strong>This device</strong></div>
      </div>
      {#if result && resultsStale}<p class="stale-box" role="status"><strong>Results are out of date.</strong> An input changed after the last run. Run the lottery again before using the archive.</p>{/if}
      <div class="controls"><button class="button primary run-action" data-testid="run-lottery" type="button" disabled={!canRun} on:click={runLottery}>{running ? 'Running the lottery…' : 'Run the Clubstonbury lottery'}</button></div>
      {#if !canRun && !running}<p><small>To run: upload a valid file, resolve club names, review warnings, enter every capacity and provide a seed.</small></p>{/if}
    </section>

    <section class="panel" id="results" aria-labelledby="results-heading">
      <div class="panel-head"><span class="panel-number">5</span><div><h2 id="results-heading" tabindex="-1">Review results</h2><p>Ticket totals and waiting lists from the most recent run.</p></div></div>
      {#if !result || !metrics}<p class="notice">Run the lottery to see results.</p>{:else}
        {#if resultsStale}<p class="stale-box"><strong>These results are out of date.</strong> Do not use them until the lottery is rerun.</p>{/if}
        <div class="result-band"><div class="stat green"><strong>{metrics.totalAllocated}</strong><span>tickets allocated</span></div><div class="stat yellow"><strong>{metrics.totalUnused}</strong><span>tickets remaining</span></div><div class="stat red"><strong>{metrics.noClub}</strong><span>children with no club</span></div><div class="stat"><strong>{metrics.firstChoice}</strong><span>received first choice</span></div></div>
        <div class="stats-grid"><div class="stat"><strong>{metrics.totalChildren}</strong><span>children</span></div><div class="stat"><strong>{metrics.totalCapacity}</strong><span>available places</span></div><div class="stat"><strong>{metrics.oneClub}</strong><span>with one club</span></div><div class="stat"><strong>{metrics.twoClubs}</strong><span>with two clubs</span></div><div class="stat"><strong>{metrics.threeClubs}</strong><span>with three clubs</span></div><div class="stat"><strong>{metrics.anyChoice}</strong><span>with any requested club</span></div><div class="stat"><strong>{metrics.clubsWithWaitingLists}</strong><span>clubs with waiting lists</span></div><div class="stat"><strong>{metrics.clubsWithRemainingCapacity}</strong><span>clubs with tickets remaining</span></div></div>
        <h3>Club lineup</h3><div class="table-wrap"><table data-testid="club-summary"><thead><tr><th>Club</th><th class="numeric">Capacity</th><th class="numeric">Allocated</th><th class="numeric">Remaining</th><th class="numeric">Waiting list</th><th>Status</th></tr></thead><tbody>{#each summaries as summary}<tr><td><strong>{summary.club}</strong></td><td class="numeric">{summary.capacity}</td><td class="numeric">{summary.allocated}</td><td class="numeric">{summary.remaining}</td><td class="numeric">{summary.waitingListLength}</td><td>{#if summary.remaining === 0}<span class="ticket-status sold">Sold out</span>{:else}<span class="ticket-status open">Tickets remaining</span>{/if}</td></tr>{/each}</tbody></table></div>
      {/if}
    </section>

    <section class="panel" id="download" aria-labelledby="download-heading">
      <div class="panel-head"><span class="panel-number">6</span><div><h2 id="download-heading">Download and clear</h2><p>The archive contains allocations, club totals, waiting lists, unallocated children and the run manifest.</p></div></div>
      {#if manifest && !resultsStale}
        <button class="button primary" data-testid="download-results" type="button" on:click={downloadArchive}>Download {archiveName}</button>
        <h3>Reproducing this lottery</h3><p>Keep the original source CSV and use the capacities, seed and algorithm below. The run time records when the button was pressed; it does not affect allocation.</p>
        <pre class="audit-code">Seed: {manifest.seed}
Algorithm: {manifest.algorithmVersion}
Input CSV SHA-256: {manifest.inputCsvSha256}
Capacities: {JSON.stringify(manifest.capacities, null, 2)}</pre>
      {:else}<p class="notice">A current lottery result is required before the results archive can be downloaded.</p>{/if}
      <div class="notice"><strong>Returned tickets and mop-up:</strong> work down the original club waiting list without reordering it. Only after that list is exhausted should remaining places be offered to late applicants or children making new choices, first come, first served.</div>
      <button class="button danger" type="button" on:click={clearAll}>Clear all data</button>
    </section>
  </div>
</main>
