<script lang="ts">
  export let compact = false;
</script>

<aside class:compact class="privacy-notice" aria-labelledby="privacy-heading">
  <span class="shield" aria-hidden="true">✓</span>
  <div>
    <h2 id="privacy-heading">Your data never leaves this device.</h2>
    <p>
      There are no uploads, accounts, cookies, analytics or tracking. After the app has been cached,
      you can work offline.
    </p>
    <a href="/privacy">Read how privacy by design works</a>
  </div>
</aside>

<style>
  .privacy-notice { display: grid; grid-template-columns: auto 1fr; gap: 1rem; align-items: start; padding: 1.35rem; background: var(--mint); border: 2px solid var(--ink); box-shadow: 5px 5px 0 var(--ink); }
  .shield { display: grid; place-items: center; width: 36px; aspect-ratio: 1; background: var(--ink); color: white; font-weight: 900; clip-path: polygon(50% 0, 92% 17%, 83% 73%, 50% 100%, 17% 73%, 8% 17%); }
  h2 { font-size: clamp(1.2rem, 3vw, 1.55rem); margin: 0 0 .3rem; }
  p { margin: 0; max-width: 70ch; }
  a { display: inline-block; margin-top: .45rem; font-weight: 800; }
  .compact { padding: 1rem; box-shadow: 3px 3px 0 var(--ink); }
  .compact h2 { font-size: 1.05rem; }
  .compact p { font-size: .9rem; }
</style>
