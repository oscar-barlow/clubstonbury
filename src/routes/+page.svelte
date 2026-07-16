<script lang="ts">
  import PrivacyNotice from '$lib/components/PrivacyNotice.svelte';

  const steps = [
    { number: '01', icon: '≡', title: 'Choose the lineup', text: 'Families choose one to three clubs and rank them in genuine preference order.' },
    { number: '02', icon: '◎', title: 'Everyone enters the same lottery', text: 'Every valid application received before the deadline is treated equally. The first morning has no advantage over the final day.' },
    { number: '03', icon: '①', title: 'First tickets first', text: 'Every child is considered for one club before anyone is considered for a second, then a third.' },
    { number: '04', icon: '✓', title: 'Rankings matter', text: 'Choices are tried in order. A backup is considered only when higher choices are unavailable, so adding one cannot harm a higher choice.' },
    { number: '05', icon: '↻', title: 'Waiting lists handle returns', text: 'If a ticket is declined, the next child on that club’s deterministic waiting list can be offered the place.' },
    { number: '06', icon: '◷', title: 'Mop-up is first come, first served', text: 'After original waiting lists are exhausted, any remaining places are offered to late applicants in the order they apply.' }
  ];
</script>

<svelte:head><title>Clubstonbury | Fairness without Stress</title></svelte:head>

<main id="main">
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">After-school club allocation</p>
      <h1>Clubstonbury</h1>
      <p class="strapline">Fairness without Stress</p>
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

  <section class="process page-width" aria-labelledby="process-heading">
    <div class="section-heading">
      <p class="eyebrow">How it works</p>
      <h2 id="process-heading">A clear route to fairer club places</h2>
      <p>No race to submit. No hidden weighting. Just three transparent rounds.</p>
    </div>
    <ol class="process-list">
      {#each steps as step}
        <li>
          <div class="step-number">{step.number}</div><span class="step-icon" aria-hidden="true">{step.icon}</span>
          <div><h3>{step.title}</h3><p>{step.text}</p></div>
        </li>
      {/each}
    </ol>
  </section>

  <section class="term-timeline page-width" aria-labelledby="timeline-heading">
    <div class="timeline-heading">
      <div><p class="eyebrow">A typical term</p><h2 id="timeline-heading">From preferences to the end of term</h2></div>
      <p>Families can submit their preferences through a familiar tool such as Google Forms or SurveyMonkey. Configure the form for one to three ranked choices, then prepare its CSV export for Clubstonbury.</p>
    </div>
    <ol class="timeline-list">
      <li><span>01</span><h3>Open the form</h3><p>Share the preferences form with every eligible family at the same time.</p></li>
      <li><span>02</span><h3>Leave it open for two weeks</h3><p>Families can respond at any point in the window. Applying earlier gives no advantage.</p></li>
      <li><span>03</span><h3>Run the allocation</h3><p>Export the responses, check the CSV, enter capacities and run the seeded lottery.</p></li>
      <li><span>04</span><h3>Do the mop-up</h3><p>Work through original waiting lists first, then offer remaining places first come, first served.</p></li>
      <li><span>05</span><h3>Term ends</h3><p>Keep the timestamped results archive as the audit record, then begin fresh next term.</p></li>
    </ol>
  </section>

  <section class="fairness-band">
    <div class="page-width fairness-inner">
      <div><p class="eyebrow">The fair-play promise</p><h2>Backups never cost a first choice.</h2></div>
      <p>Lottery position depends only on the child’s opaque ID, the published algorithm version and the run seed. Submission times are preserved for the record, but never used to allocate a place.</p>
    </div>
  </section>

  <section class="page-width final-cta">
    <div><p class="eyebrow">Ready at the gate?</p><h2>Turn a lineup into fair allocations.</h2></div>
    <a class="button primary" href="/allocate">Open the allocation tool <span aria-hidden="true">→</span></a>
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
  @media (max-width: 760px) {
    .term-timeline { padding-block: 0 4rem; }
    .timeline-heading { grid-template-columns: 1fr; gap: 1rem; }
    .timeline-list { grid-template-columns: 1fr; border-top: 0; border-left: 3px solid var(--ink); margin-left: .5rem; }
    .timeline-list li { padding: 0 0 2rem 1.5rem; }
    .timeline-list li::before { top: 3px; left: -10px; }
  }
</style>
