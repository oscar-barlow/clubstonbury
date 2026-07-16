<script lang="ts">
  import PolicyPage from '$lib/components/PolicyPage.svelte';
</script>

<svelte:head>
  <title>Privacy | Clubstonbury</title>
  <meta name="description" content="How Clubstonbury keeps application data private on your device and supports UK GDPR compliance." />
</svelte:head>

<PolicyPage
  eyebrow="Privacy by design"
  title="Private here. Pseudonymous at school."
  intro="Clubstonbury is deliberately built so the site operator never receives your application CSV or allocation results. Processing stays in your browser, and the allocation file should use opaque IDs instead of children's names."
  reviewed="16 July 2026"
>
  <section>
    <div class="policy-callout">
      <h2>Your application data never leaves this device</h2>
      <p>The browser reads the CSV into memory, validates it, runs the lottery and creates the result ZIP locally. Running an allocation makes no network requests. Clubstonbury has no backend, accounts, database or server-side upload.</p>
    </div>
  </section>

  <section>
    <h2>What the site does and does not collect</h2>
    <div class="policy-grid">
      <div><h3>Processed locally</h3><ul><li>Opaque child IDs and submission timestamps</li><li>Ranked club choices and club capacities</li><li>Seeds, allocations and waiting lists</li></ul></div>
      <div><h3>Not collected by Clubstonbury</h3><ul><li>Uploaded CSV contents or result files</li><li>Names, email addresses or family profiles</li><li>Cookies, analytics or tracking identifiers</li><li>Error reports, advertising data or browser storage records</li></ul></div>
    </div>
    <p>The first visit still requests the static website from its hosting provider. Like most web hosting, that provider may process ordinary request metadata such as an IP address. It does not receive the CSV selected in your browser.</p>
  </section>

  <section>
    <h2>Anonymous to Clubstonbury does not always mean anonymous to the school</h2>
    <p>Use a random, opaque ID for each child and keep the separate ID-to-name lookup under the school's control. Clubstonbury cannot identify a child because it never receives either file.</p>
    <div class="policy-warning"><strong>Important:</strong> if the school can use a separate lookup to reconnect an ID to a child, the allocation data is <em>pseudonymised</em>, not fully anonymised. UK data protection law still applies to that data and to the lookup. Keep them separate and protect the lookup with appropriate access controls.</div>
  </section>

  <section>
    <h2>How the design supports UK GDPR compliance</h2>
    <p>The local-only workflow helps schools apply data minimisation, data protection by design and appropriate security. The tool needs only an opaque ID, timestamp and club choices; it does not need a child's name, contact details, year group or profile.</p>
    <p>Using Clubstonbury is not, by itself, a complete guarantee of GDPR compliance. The school remains the data controller and is responsible for the wider process.</p>
    <ul>
      <li>Choose and document an appropriate lawful basis.</li>
      <li>Give families an accurate privacy notice for the survey and allocation process.</li>
      <li>Collect only information needed for club allocation.</li>
      <li>Keep the ID lookup separate, access-controlled and encrypted where appropriate.</li>
      <li>Set retention periods for survey responses, mappings and result archives, then delete them securely.</li>
      <li>Handle accuracy, access and other data-subject rights through the school's normal procedures.</li>
      <li>Consult the school's data protection officer and complete a DPIA where the circumstances require one.</li>
    </ul>
  </section>

  <section>
    <h2>Memory, downloads and offline use</h2>
    <p>Uploaded data remains in page memory only. Refreshing or closing the page discards it, and <strong>Clear all data</strong> removes the current in-memory workflow. Downloaded ZIP files are under the administrator's control and should be stored according to school policy.</p>
    <p>A service worker caches the application code and local assets so the tool can work offline. It does not cache uploaded CSV contents or results.</p>
  </section>

  <section>
    <h2>Authoritative guidance</h2>
    <p>This page explains Clubstonbury's design and is not legal advice. For current requirements, use the Information Commissioner's Office guidance:</p>
    <ul>
      <li><a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-by-design-and-by-default/" rel="noreferrer">Data protection by design and by default</a></li>
      <li><a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/pseudonymisation/" rel="noreferrer">Pseudonymisation</a></li>
      <li><a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/" rel="noreferrer">Data minimisation</a></li>
    </ul>
  </section>
</PolicyPage>
