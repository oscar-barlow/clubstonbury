<script lang="ts">
  import '../styles.css';
  let { children } = $props();
</script>

<svelte:head><title>Clubstonbury | Fairness without Stress</title></svelte:head>

<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header">
  <a class="brand" href="/" aria-label="Clubstonbury home">
    <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
    <span>Clubstonbury</span>
  </a>
  <nav aria-label="Main navigation">
    <a href="/">How it works</a>
    <a href="/demo">Demo data</a>
    <a class="nav-action" href="/allocate">Allocate places</a>
  </nav>
</header>

{@render children()}

<footer class="site-footer">
  <div><strong>Clubstonbury</strong><span>Fairness without Stress</span></div>
  <p><span aria-hidden="true">▣</span> No accounts, cookies, analytics or tracking.</p>
</footer>
