<script lang="ts">
  import '../styles.css';
  let { children } = $props();
</script>

<svelte:head><title>Clubstonbury</title></svelte:head>

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
  <div><strong>Clubstonbury</strong></div>
  <nav class="footer-links" aria-label="Legal and project links"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a class="github-link" href="https://github.com/oscar-barlow/clubstonbury" target="_blank" rel="noreferrer"><img src="/logos/github-octocat.svg" alt="" /> <span>Source on GitHub</span></a></nav>
  <p class="footer-meta"><span aria-hidden="true">▣</span> No accounts or cookies. Allocation data stays on your device.</p>
</footer>
