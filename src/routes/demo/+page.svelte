<script lang="ts">
  const applications = [
    ['demo_7f3a', 'Astronomy', 'Robotics', 'Nature Lab'],
    ['demo_19bc', 'Robotics', 'Astronomy', 'Orchestra'],
    ['demo_a821', 'Orchestra', 'Cookery and Baking', ''],
    ['demo_5de0', 'Skateboarding', 'Nature Lab', 'Astronomy'],
    ['demo_c447', 'Nature Lab', 'Robotics', '']
  ];
</script>

<svelte:head>
  <title>Demo data | Clubstonbury</title>
  <meta name="description" content="Download synthetic Clubstonbury data for a practice allocation." />
</svelte:head>

<main id="main" class="demo-main">
  <section class="demo-hero">
    <div class="page-width">
      <p class="eyebrow">Practice wristband</p>
      <h1>Try a demo lineup</h1>
      <p class="strapline">Fake data. Real workflow.</p>
      <p class="demo-lede">Download both files, open the allocation tool and run a complete lottery without using any real application data.</p>
    </div>
  </section>

  <div class="page-width demo-content">
    <section class="demo-downloads" aria-labelledby="downloads-heading">
      <div class="section-heading demo-heading">
        <p class="eyebrow">Demo pack</p>
        <h2 id="downloads-heading">Two files get you started</h2>
        <p>These records are entirely synthetic. The capacities deliberately create sold-out clubs and waiting lists.</p>
      </div>

      <div class="download-list">
        <article class="download-ticket">
          <span class="ticket-number" aria-hidden="true">01</span>
          <div><h3>Applications</h3><p>18 fake applications across six clubs, with one to three ranked choices.</p><code>clubstonbury-demo-applications.csv</code></div>
          <a class="button primary" href="/demo/clubstonbury-demo-applications.csv" download>Download applications</a>
        </article>
        <article class="download-ticket">
          <span class="ticket-number" aria-hidden="true">02</span>
          <div><h3>Capacities</h3><p>Matching capacities ready to upload in the capacity step.</p><code>clubstonbury-demo-capacities.csv</code></div>
          <a class="button secondary" href="/demo/clubstonbury-demo-capacities.csv" download>Download capacities</a>
        </article>
      </div>
    </section>

    <section class="demo-preview" aria-labelledby="preview-heading">
      <div><p class="eyebrow">A quick look</p><h2 id="preview-heading">Inside the application file</h2><p>IDs are opaque and invented. Timestamps are varied to demonstrate that submission time does not affect the result.</p></div>
      <div class="table-wrap"><table><thead><tr><th>ID</th><th>First choice</th><th>Second choice</th><th>Third choice</th></tr></thead><tbody>{#each applications as application}<tr>{#each application as value}<td>{value}</td>{/each}</tr>{/each}</tbody></table></div>
    </section>

    <section class="demo-next" aria-labelledby="next-heading">
      <div><p class="eyebrow">Next stop</p><h2 id="next-heading">Take the files to the allocation tent</h2><p>This demo page only provides fake files. Open the separate allocation tool, upload applications first, then import the matching capacity file when the discovered club list appears.</p></div>
      <a class="button primary" href="/allocate" data-sveltekit-reload>Open the allocation tool <span aria-hidden="true">→</span></a>
    </section>
  </div>
</main>

<style>
  .demo-main { background: #f3f7f4; padding-bottom: 5rem; }
  .demo-hero { background: var(--red); color: white; border-bottom: 2px solid var(--ink); padding: clamp(3.5rem, 8vw, 7rem) 0; }
  .demo-hero h1 { max-width: 820px; }
  .demo-hero .strapline { color: var(--yellow); }
  .demo-lede { max-width: 680px; font-size: 1.1rem; }
  .demo-content { margin-top: -2rem; position: relative; }
  .demo-downloads, .demo-preview, .demo-next { background: white; border: 2px solid var(--ink); padding: clamp(1.2rem, 4vw, 2.5rem); margin-bottom: 1.25rem; }
  .demo-heading { margin-bottom: 2rem; }
  .download-list { display: grid; gap: 1rem; }
  .download-ticket { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 1.25rem; align-items: center; padding: 1.25rem; border: 2px dashed var(--ink); background: #fff8dc; }
  .download-ticket:nth-child(2) { background: #e6f7f8; }
  .ticket-number { display: grid; place-items: center; width: 48px; aspect-ratio: 1; background: var(--ink); color: white; font-weight: 900; }
  .download-ticket h3 { margin: 0 0 .2rem; font-size: 1.25rem; }
  .download-ticket p { margin: 0 0 .35rem; color: var(--muted); }
  .download-ticket code { font-size: .8rem; overflow-wrap: anywhere; }
  .demo-preview { display: grid; grid-template-columns: .7fr 1.3fr; gap: 2rem; align-items: start; }
  .demo-preview h2, .demo-next h2 { margin: 0 0 .6rem; font-size: clamp(1.6rem, 4vw, 2.5rem); line-height: 1.05; }
  .demo-next { display: flex; justify-content: space-between; align-items: center; gap: 2rem; background: var(--mint); }
  .demo-next p:last-child { margin-bottom: 0; }
  @media (max-width: 760px) {
    .demo-content { margin-top: 1rem; }
    .download-ticket { grid-template-columns: auto 1fr; }
    .download-ticket .button { grid-column: 1 / -1; }
    .demo-preview { grid-template-columns: 1fr; }
    .demo-next { align-items: stretch; flex-direction: column; }
  }
</style>
