<script lang="ts">
  import type { Snippet } from 'svelte';

  let { eyebrow, title, intro, reviewed, children }: {
    eyebrow: string;
    title: string;
    intro: string;
    reviewed: string;
    children: Snippet;
  } = $props();
</script>

<main id="main" class="policy-main">
  <header class="policy-hero">
    <div class="page-width">
      <p class="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p class="policy-intro">{intro}</p>
      <p class="reviewed">Last reviewed {reviewed}</p>
    </div>
  </header>
  <article class="policy-content page-width">
    {@render children()}
  </article>
</main>

<style>
  .policy-main { background: #f3f7f4; padding-bottom: 5rem; }
  .policy-hero { padding: clamp(3.5rem, 8vw, 6.5rem) 0; background: var(--blue); border-bottom: 2px solid var(--ink); }
  .policy-hero h1 { max-width: 900px; font-size: clamp(2.8rem, 7vw, 5.5rem); }
  .policy-intro { max-width: 760px; margin: 1.5rem 0 .75rem; font-size: 1.15rem; }
  .reviewed { margin: 0; font-size: .85rem; font-weight: 750; }
  .policy-content { margin-top: -2rem; padding: clamp(1.25rem, 5vw, 3.5rem); background: white; border: 2px solid var(--ink); }
  :global(.policy-content section) { padding: 0 0 2.25rem; margin: 0 0 2.25rem; border-bottom: 2px solid var(--line); }
  :global(.policy-content section:last-child) { padding-bottom: 0; margin-bottom: 0; border-bottom: 0; }
  :global(.policy-content h2) { margin: 0 0 .75rem; font-size: clamp(1.45rem, 4vw, 2.2rem); line-height: 1.1; }
  :global(.policy-content h3) { margin: 1.25rem 0 .35rem; }
  :global(.policy-content p) { max-width: 78ch; }
  :global(.policy-content li) { margin-bottom: .6rem; max-width: 76ch; }
  :global(.policy-callout) { padding: 1.2rem; border: 2px solid var(--ink); background: var(--mint); box-shadow: 4px 4px 0 var(--ink); }
  :global(.policy-warning) { padding: 1.2rem; border-left: 6px solid var(--red); background: #fff3ef; }
  :global(.policy-grid) { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 2rem; }
  @media (max-width: 680px) {
    .policy-hero h1 { font-size: 2.65rem; }
    .policy-content { margin-top: 1rem; }
    :global(.policy-grid) { grid-template-columns: 1fr; }
  }
</style>
