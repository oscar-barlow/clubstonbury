<script lang="ts">
  import PrivacyNotice from '$lib/components/PrivacyNotice.svelte';

  const principles = [
    { icon: '≡', title: 'Families get choice', text: 'Families choose up to three clubs for their child, ranked in preference order.' },
    { icon: '✓', title: 'Rankings matter', text: 'Choices are considered in order of preference. A lower-ranked choice is considered only when higher-ranked choices are unavailable, so ranking another choice cannot harm a higher-ranked choice.' },
    { icon: '◎', title: 'Everyone enters the same lottery', text: 'Every valid application received before the deadline is treated equally. Applying on the first morning gives no advantage over applying on the final day, removing time pressure and stress for families.' },
    { icon: '◆', title: 'First tickets first', text: 'Every child is considered for one club before anyone is considered for a second, then a third.' },
    { icon: '↻', title: 'Waiting lists are included', text: 'The results include a deterministic waiting list for each club. If a place is declined, administrators can offer it to the next child on that list.' },
    { icon: '◷', title: 'Mop-up is first come, first served', text: 'For places a school puts into mop-up, late or changed applications are handled in the order they arrive.' }
  ];
</script>

<svelte:head><title>Clubstonbury</title></svelte:head>

<main id="main">
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">After-school club allocation</p>
      <h1>Clubstonbury</h1>
      <p class="lede">Choose 3 clubs for your child and enter the lottery. The Clubstonbury algorithm allocates places fairly. Everyone who applies before the deadline is treated equally.</p>
      <a class="button primary" href="/allocate">Start an allocation <span aria-hidden="true">→</span></a>
    </div>
    <div class="festival-scene" aria-hidden="true">
      <div class="sun"></div>
      <div class="bunting bunting-one"></div><div class="bunting bunting-two"></div>
      <div class="gate"><span>1</span><span>2</span><span>3</span></div>
      <div class="tent tent-one"></div><div class="tent tent-two"></div><div class="tent tent-three"></div>
      <div class="ground-line"></div>
    </div>
  </section>

  <div class="page-width privacy-wrap"><PrivacyNotice /></div>

  <section class="process page-width" id="principles" aria-labelledby="process-heading">
    <div class="section-heading">
      <p class="eyebrow">Principles</p>
      <h2 id="process-heading">Clubs matter. The stampede doesn’t have to.</h2>
      <p>After-school clubs are an important part of the school experience. But first-come, first-served booking can create a stampede, putting families under pressure and leaving school staff to manage the rush.</p>
    </div>
    <ul class="process-list">
      {#each principles as principle}
        <li>
          <span class="step-icon" aria-hidden="true">{principle.icon}</span>
          <div><h3>{principle.title}</h3><p>{principle.text}</p></div>
        </li>
      {/each}
    </ul>
  </section>

  <section class="term-timeline page-width" aria-labelledby="timeline-heading">
    <div class="timeline-heading">
      <h2 id="timeline-heading">5 easy steps</h2>
      <p>Use the survey and spreadsheet tools your school already has. Families can submit their preferences through Google Forms or SurveyMonkey, then Clubstonbury reads the CSV export. No new account, platform or integration is needed.</p>
    </div>
    <ol class="timeline-list">
      <li><span>01</span><h3>Create and share the form</h3><p>Share the preferences form with every eligible family at the same time.</p></li>
      <li><span>02</span><h3>Leave it open</h3><p>Families can respond at any point in the window. Applying earlier gives no advantage.</p></li>
      <li><span>03</span><h3>Run the allocation</h3><p>Export the responses, check the CSV, enter capacities and run the seeded lottery.</p></li>
      <li><span>04</span><h3>Do the mop-up</h3><p>Decide how to use the generated waiting lists, then handle any mop-up places first come, first served.</p></li>
      <li><span>05</span><h3>Done!</h3><p>Send invoices, and file the allocation data for your records.</p></li>
    </ol>
  </section>

  <section class="guides-band" aria-labelledby="guides-heading">
    <div class="page-width guides-inner">
      <div class="guides-intro">
        <p class="eyebrow">Print and share</p>
        <h2 id="guides-heading">Practical Guides</h2>
        <p>Two concise, illustrated guides for planning the process, explaining the lottery and keeping a defensible audit trail.</p>
      </div>
      <div class="guide-list">
        <article class="guide-item">
          <div><p class="guide-meta">Administrator guide · 2-page PDF</p><h3>5 Steps to run a club allocation</h3><p>Set up the survey, pseudonymise the export, prepare capacities, run the tool and securely join names back into the results.</p></div>
          <a class="button" href="/guides/clubstonbury-admin-guide.pdf" download>Download administrator guide <span aria-hidden="true">↓</span></a>
        </article>
        <article class="guide-item">
          <div><p class="guide-meta">Algorithm guide · 2-page PDF</p><h3>How the lottery works</h3><p>See how children are put into a randomised order and their clubs are tried in preference order, across up to three rounds.</p></div>
          <a class="button" href="/guides/clubstonbury-algorithm-guide.pdf" download>Download algorithm guide <span aria-hidden="true">↓</span></a>
        </article>
      </div>
    </div>
  </section>

  <section class="fairness-band">
    <div class="page-width fairness-inner">
      <div><p class="eyebrow">A practical alternative</p><h2>Free, fair and private, without another school platform.</h2></div>
      <p>Keep the forms and spreadsheets you already use. Clubstonbury takes a CSV, runs locally in the browser and gives you an allocation archive to bring back into your records. No account, subscription or integration is required.</p>
    </div>
  </section>

  <section class="page-width final-cta">
    <div><p class="eyebrow">Ready at the gate?</p><h2>Take the rush out of club allocation.</h2></div>
    <div class="final-actions">
      <a class="button secondary" href="/demo">Try it with demo data</a>
      <a class="button primary" href="/allocate">Start an allocation <span aria-hidden="true">→</span></a>
    </div>
  </section>
</main>

<style>
  .term-timeline { padding-block: 1rem 7rem; }
  .timeline-heading { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: end; margin-bottom: 3rem; }
  .timeline-heading h2 { margin: 0; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1; }
  .timeline-heading > p { margin: 0; color: var(--muted); font-size: 1.05rem; }
  .timeline-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); border-top: 3px solid var(--ink); }
  .timeline-list li { position: relative; padding: 1.5rem 1rem 0 0; }
  .timeline-list li::before { content: ''; position: absolute; width: 15px; aspect-ratio: 1; border-radius: 50%; background: var(--red); border: 3px solid var(--paper); outline: 2px solid var(--ink); top: -10px; left: 0; }
  .timeline-list span { display: block; color: var(--red); font-weight: 900; margin-bottom: .65rem; }
  .timeline-list h3 { margin: 0 0 .4rem; font-size: 1.05rem; }
  .timeline-list p { margin: 0; color: var(--muted); font-size: .9rem; }
  .guides-band { padding-block: 5rem; background: #edf8f2; border-top: 2px solid var(--ink); }
  .guides-inner { display: grid; grid-template-columns: minmax(260px, .75fr) minmax(0, 1.25fr); gap: clamp(2rem, 6vw, 6rem); }
  .guides-intro h2 { margin: 0; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1; }
  .guides-intro > p:last-child { color: var(--muted); font-size: 1.05rem; }
  .guide-list { border-top: 2px solid var(--ink); }
  .guide-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 1.5rem; align-items: center; padding-block: 1.5rem; border-bottom: 2px solid var(--ink); }
  .guide-item h3 { margin: 0 0 .35rem; font-size: 1.35rem; }
  .guide-item p { margin: 0; color: var(--muted); }
  .guide-meta { margin-bottom: .45rem !important; color: var(--red) !important; font-size: .76rem; font-weight: 900; text-transform: uppercase; }
  .guide-item .button { max-width: 250px; text-align: center; }
  .final-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 1rem; }
  @media (max-width: 760px) {
    .term-timeline { padding-block: 0 4rem; }
    .timeline-heading { grid-template-columns: 1fr; gap: 1rem; }
    .timeline-list { grid-template-columns: 1fr; border-top: 0; border-left: 3px solid var(--ink); margin-left: .5rem; }
    .timeline-list li { padding: 0 0 2rem 1.5rem; }
    .timeline-list li::before { top: 3px; left: -10px; }
    .guides-band { padding-block: 4rem; }
    .guides-inner, .guide-item { grid-template-columns: 1fr; }
    .guides-inner { gap: 2rem; }
    .guide-item { gap: 1rem; }
    .guide-item .button { width: 100%; max-width: none; }
    .final-actions { width: 100%; flex-direction: column; }
    .final-actions .button { width: 100%; }
  }
</style>
