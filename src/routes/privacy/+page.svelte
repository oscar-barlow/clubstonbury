<script lang="ts">
  import PolicyPage from '$lib/components/PolicyPage.svelte';
</script>

<svelte:head>
  <title>Privacy | Clubstonbury</title>
  <meta name="description" content="How Clubstonbury processes application data privately inside your browser without uploading it." />
</svelte:head>

<PolicyPage
  eyebrow="Privacy by design"
  title="Your allocation stays on your device"
  intro="Clubstonbury is a static website with no application server or database. Your CSV is read, checked and processed inside your browser, so the site operator never receives your application data or results."
  reviewed="16 July 2026"
>
  <section>
    <div class="policy-callout">
      <h2>Files are processed locally, not uploaded</h2>
      <p>When you select a CSV, the browser reads it directly into memory. Validation, the seeded lottery, waiting lists and the result ZIP are all produced on this device. The allocation workflow does not upload its inputs or outputs.</p>
    </div>
  </section>

  <section>
    <h2>What happens in the browser</h2>
    <div class="policy-grid">
      <div><h3>Used for the current session</h3><ul><li>Opaque child IDs and submission timestamps</li><li>Club choices and capacities</li><li>The seed, allocations and waiting lists</li></ul></div>
      <div><h3>Never sent to Clubstonbury</h3><ul><li>The contents of selected files</li><li>Allocation results or downloaded ZIP files</li><li>Names, email addresses or family profiles</li><li>Anything entered into the allocation workflow</li></ul></div>
    </div>
  </section>

  <section>
    <h2>The algorithm does not need children's identities</h2>
    <p>Clubstonbury works with opaque IDs. It does not ask for or use a child's name, email address, contact details or profile. An ID is used only to give that application a reproducible lottery position and to label its results.</p>
    <p>Because neither the selected CSV nor an identity list is sent to Clubstonbury, the site operator cannot connect an allocation ID to a particular child.</p>
  </section>

  <section>
    <h2>No accounts, cookies or personal tracking</h2>
    <p>The site has no sign-in, user accounts, advertising or error-reporting service. Clubstonbury does not save selected data or results to local storage or a browser database.</p>
    <p>Clubstonbury uses <a href="https://www.simpleanalytics.com/" rel="noreferrer">Simple Analytics</a> to understand aggregate site use. The browser loads its third-party script, or a small image when JavaScript is disabled. It records metrics such as the page visited, referrer, time zone, browser and device category, language, screen dimensions and scroll depth.</p>
    <p>Simple Analytics states that it uses no cookies, local storage, fingerprinting or user/device identifiers, and that IP addresses are discarded rather than stored. The site operator sees aggregate traffic reports, not individual visitor profiles. Clubstonbury does not send selected CSV contents, opaque child IDs, choices, capacities, seeds or allocation results through analytics. See <a href="https://docs.simpleanalytics.com/data-collection" rel="noreferrer">Simple Analytics' data-collection documentation</a> for details.</p>
  </section>

  <section>
    <h2>Temporary memory and local downloads</h2>
    <p>Selected data remains in page memory only. Refreshing or closing the page discards it, and <strong>Clear all data</strong> removes the current workflow from memory. The result ZIP is created locally and goes straight to the browser's normal download location.</p>
    <p>A service worker caches only the application code and bundled assets so the tool can work offline. It never caches selected CSV contents or allocation results.</p>
  </section>

  <section>
    <h2>The design is open to inspection</h2>
    <p>Clubstonbury is open-source software. Its browser-only allocation, CSV handling, result generation and offline cache can all be inspected in the <a href="https://github.com/oscar-barlow/clubstonbury" rel="noreferrer">public GitHub repository</a>.</p>
  </section>
</PolicyPage>
