<script lang="ts">
  import PolicyPage from '$lib/components/PolicyPage.svelte';
</script>

<svelte:head>
  <title>Terms of use | Clubstonbury</title>
  <meta name="description" content="Terms for using the Clubstonbury allocation tool." />
</svelte:head>

<PolicyPage
  eyebrow="Terms of use"
  title="You remain responsible for every decision"
  intro="Clubstonbury is a free allocation tool. Use it at your own risk. The school or administrator running a lottery is fully responsible for the inputs, settings, interpretation and use of its results."
  reviewed="16 July 2026"
>
  <section>
    <div class="policy-warning"><strong>Check before acting.</strong> Do not offer or withdraw a club place until an authorised person has checked the source data, capacities, seed, validation warnings and exported results.</div>
  </section>

  <section>
    <h2>Your responsibilities</h2>
    <p>By using Clubstonbury, you accept responsibility for:</p>
    <ul>
      <li>having authority and an appropriate lawful basis to process the application data;</li>
      <li>ensuring choices and eligibility were collected and checked correctly;</li>
      <li>using unique opaque IDs and protecting any separate identity lookup;</li>
      <li>entering accurate club capacities and reviewing every validation warning;</li>
      <li>keeping the source CSV, seed, algorithm version and result archive needed for audit;</li>
      <li>checking allocations and waiting lists before communicating decisions; and</li>
      <li>operating refusals, waiting lists and first-come, first-served mop-up consistently.</li>
    </ul>
  </section>

  <section>
    <h2>No warranty or professional advice</h2>
    <p>The software is provided “as is” and “as available”, without warranties of accuracy, availability, fitness for a particular purpose or non-infringement. It is not legal, data-protection, educational or admissions advice. A deterministic result can still be wrong for your situation if its input data or settings are wrong.</p>
    <p>You are responsible for maintaining appropriate backups. Data entered in the browser is intentionally not saved by Clubstonbury and cannot be recovered by the site operator.</p>
  </section>

  <section>
    <h2>Fairness and suitability</h2>
    <p>Clubstonbury implements the published three-round algorithm for the ordinary allocation model described on this site. You must decide whether that model is suitable for your school and whether other duties, priority rules or reasonable adjustments apply. Do not use it where the published algorithm conflicts with your governing policy or legal obligations.</p>
  </section>

  <section>
    <h2>Limitation of liability</h2>
    <p>To the fullest extent permitted by applicable law, the authors and contributors are not liable for losses, missed or incorrect allocations, lost data, service interruption or decisions made using the software. Nothing on this page excludes liability that cannot lawfully be excluded.</p>
  </section>

  <section>
    <h2>Open-source software</h2>
    <p>The Clubstonbury source code is licensed under the MIT License. The repository licence governs copying, modification and distribution of the software. These site terms explain responsibility for operating the hosted tool.</p>
    <p><a href="https://github.com/oscar-barlow/clubstonbury" rel="noreferrer">View the source repository on GitHub</a>.</p>
  </section>
</PolicyPage>
