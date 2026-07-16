# Clubstonbury — Product and Technical Brief

## 1. Product summary

Build **Clubstonbury**, a small browser-based application for fairly allocating limited places in
after-school clubs.

The visual metaphor is applying for tickets to a cheerful, family-friendly festival:

- Clubs are the festival lineup.
- Children submit up to three ranked “ticket choices”.
- Places are allocated through a transparent lottery.
- There is no frantic first-come-first-served scramble.

The application should be simple enough for a school administrator to use without training.

It must operate entirely in the browser. Uploaded application data must never be sent to a server.

## 2. Core proposition

Clubstonbury should communicate three ideas clearly:

1. Every application submitted during the application window is treated equally.
2. Children are considered for one club each before anyone is considered for a second or third club.
3. Adding backup choices never reduces the chance of receiving a higher-ranked choice.

Submission timestamps are used only as information. They must not influence lottery results.

Applications submitted after the deadline are handled separately during mop-up.

## 3. Technology

Use:

- SvelteKit
- TypeScript
- Deno as the runtime, dependency manager and task runner
- Nix flakes for the development environment
- direnv for automatic development-environment activation
- `nix-direnv` where available
- `@sveltejs/adapter-static`
- Static SPA deployment to Render

Do not build a backend.

Do not create:

- Server endpoints
- A database
- User accounts
- Authentication
- Server-side file uploads
- Server-side allocation logic

All CSV parsing, validation, allocation and export generation must happen in the browser.

## 4. Development environment

The normal development workflow must use **direnv**.

Entering the project directory should automatically activate the Nix development environment.
Developers should not ordinarily need to run `nix develop` manually.

Commit:

```text
flake.nix
flake.lock
.envrc
.gitignore
deno.json
deno.lock
package.json
```

A minimal `.envrc` should contain:

```sh
use flake
```

Add the generated direnv directory to `.gitignore`:

```gitignore
.direnv/
```

The Nix development shell should provide at least:

- Deno
- Git
- Any native utilities genuinely required by the build or tests
- A predictable UTF-8 locale

Do not install Node.js, npm, Yarn or pnpm as part of the normal workflow.

A `package.json` may exist because SvelteKit and Vite use npm package metadata, but:

- Dependencies must be installed and resolved through Deno.
- Commands must be exposed through `deno task`.
- Do not create `package-lock.json`, `yarn.lock` or `pnpm-lock.yaml`.
- Commit `deno.lock`.

Use Deno’s npm compatibility support for SvelteKit, Vite and related packages.

Do not silently fall back to a Node-based workflow. If a dependency does not work under Deno,
replace it with a compatible dependency where practical.

Provide Deno tasks for:

```text
deno task dev
deno task check
deno task test
deno task test:e2e
deno task build
deno task preview
deno task fmt
deno task lint
```

The expected setup flow should be:

```sh
git clone <repository>
cd clubstonbury
direnv allow
deno task dev
```

Document the one-time prerequisites:

1. Install Nix with flakes enabled.
2. Install direnv.
3. Add the direnv hook to the developer’s shell.
4. Preferably install and configure nix-direnv.
5. Run `direnv allow` inside the repository.

Changes to `flake.nix`, `flake.lock` or `.envrc` should cause direnv to reload the environment.

## 5. Application structure

The site has two routes:

```text
/
/allocate
```

### `/`

A public-facing explanation of how Clubstonbury works.

### `/allocate`

The complete CSV upload, configuration, allocation and download workflow.

Keep the application deliberately small. Do not add an administration dashboard or additional routes
unless technically necessary.

## 6. Home page

The home page should explain the algorithm in accessible, non-technical language.

Suggested hero copy:

> **Welcome to Clubstonbury** Fairer club tickets, without the 9am scramble.

Suggested supporting copy:

> Rank up to three clubs, enter the lottery and let Clubstonbury allocate places fairly. Everyone
> who applies before the deadline is treated equally, regardless of when during the application
> window they submitted their choices.

The page should explain the process in a short sequence.

### Step 1: Choose the lineup

Families choose between one and three clubs and rank them in order of preference.

### Step 2: Everyone enters the same lottery

Every valid application received before the deadline is treated equally.

Submitting on the first morning provides no advantage over submitting on the final day.

### Step 3: First tickets first

Clubstonbury tries to give every child one club before giving anyone a second club.

Only after first allocations are complete does it allocate second clubs, followed by third clubs.

### Step 4: Rankings matter

When a child’s turn arrives, Clubstonbury attempts their choices in order:

1. First choice
2. Second choice
3. Third choice

A lower-ranked choice is only considered if the higher-ranked choices are unavailable.

Adding backup choices cannot reduce the chance of receiving a higher choice.

### Step 5: Waiting lists handle returned tickets

When an allocated place is declined, the place can be offered to the next child on that club’s
waiting list.

### Step 6: Mop-up

After the original applications and waiting lists have been processed, remaining places can be
offered to late applicants or children who did not originally select those clubs.

## 7. Privacy messaging

Privacy should be one of the most prominent messages on both pages.

Suggested copy:

> **Your data never leaves this device.** Clubstonbury processes your CSV entirely inside your
> browser. There are no uploads, accounts, cookies, analytics or tracking. Once the site has loaded,
> you can turn off your internet connection and continue using it.

Be precise about offline behaviour:

- The initial visit downloads the static application from Render.
- A service worker caches the application shell and required assets.
- After the application has been cached, it should load and operate without an internet connection.
- Running an allocation must make no network requests.

Do not use:

- Analytics
- Error-reporting services
- Tracking pixels
- Advertising
- Cookies
- Third-party fonts
- Remote images
- CDNs
- Server-side logging of application data
- Browser storage for uploaded application data

Uploaded data should remain in memory only.

Provide a visible **Clear all data** action that removes:

- The loaded CSV
- Parsed application records
- Entered capacities
- Allocation results
- Generated download data

The service worker may cache the application’s static code and assets, but must never cache uploaded
CSV contents or allocation results.

## 8. Branding and visual direction

The site is called **Clubstonbury**.

It should feel like applying for tickets to a friendly family festival.

Possible visual motifs:

- Perforated ticket stubs
- Festival wristbands
- Bunting
- Colourful tents
- Friendly suns, clouds and stars
- Hand-drawn arrows
- Lineup boards
- Entrance gates
- Stacked passes representing ranked choices
- A festival map showing the three allocation rounds
- “Sold out” signs for clubs that reach capacity
- Waiting-list tickets

The three allocation stages could be illustrated as three festival gates:

1. First-club gate
2. Second-club gate
3. Third-club gate

The visual tone should be:

- Cheerful
- Trustworthy
- Slightly playful
- Family-friendly
- Suitable for school administrators
- Not corporate
- Not childish
- Not visually chaotic

Do not copy Glastonbury Festival’s:

- Logo
- Typography
- Artwork
- Photography
- Exact colour palette
- Distinctive branded assets

Clubstonbury should have its own identity.

Use locally bundled fonts or system fonts only.

Use a warm and lively colour palette with strong contrast. Do not communicate information through
colour alone.

Animations should be subtle and must respect `prefers-reduced-motion`.

## 9. Allocation-page workflow

The `/allocate` page should guide the administrator through:

1. Upload CSV
2. Validate applications
3. Review discovered clubs
4. Enter capacities
5. Review lottery settings
6. Run allocation
7. Review results
8. Download results
9. Clear data

This may be presented as a vertical sequence of panels or an accessible stepper.

Do not hide previous steps once completed. The administrator should be able to go back, correct an
input and rerun the allocation.

Changing any input after allocation should clearly mark the existing results as stale.

## 10. Input CSV

The user supplies a CSV with exactly these required column names:

```csv
id,timestamp,choice_1,choice_2,choice_3
```

Example:

```csv
id,timestamp,choice_1,choice_2,choice_3
kid_a8f2,2026-09-01T14:23:00Z,Football,Drama,Coding
kid_b129,2026-09-02T09:05:00Z,Drama,Art,
kid_c731,2026-09-03T18:42:00Z,Football,,
```

### Field definitions

#### `id`

A unique opaque identifier for the child.

It should not be the child’s name.

Clubstonbury should treat the ID as an arbitrary string and must not attempt to decode or interpret
it.

#### `timestamp`

The time at which the application was submitted.

The timestamp must be parsed and preserved in the outputs, but it must not influence the allocation.

V1 assumes that the uploaded CSV contains only applications accepted into the main lottery.

Late applications should be processed later as part of mop-up.

#### `choice_1`

The child’s highest-ranked club.

This field is required.

#### `choice_2`

The child’s second-ranked club.

This field may be blank.

#### `choice_3`

The child’s third-ranked club.

This field may be blank.

## 11. CSV rules

Apply these rules:

- Column names are case-sensitive.
- All five required columns must be present.
- Additional columns should produce a warning but may be ignored.
- `id` must be non-empty.
- IDs must be unique.
- `timestamp` must be a valid timestamp.
- `choice_1` must be non-empty.
- `choice_2` and `choice_3` may be empty.
- Choices must be contiguous.
- `choice_3` cannot be supplied when `choice_2` is blank.
- The same club cannot appear more than once for the same child.
- Trim leading and trailing whitespace.
- Ignore completely empty rows.
- Preserve the original ID exactly after trimming.
- Preserve the original timestamp in the output.
- Normalise line endings.
- Correctly handle quoted CSV fields and commas inside quoted values.
- Support UTF-8 club names.
- Strip a UTF-8 byte-order mark when present.

Use a robust CSV parser rather than implementing CSV parsing with string splitting.

## 12. Club-name handling

Club names should be compared using a canonical representation while retaining a display value.

At minimum:

- Trim surrounding whitespace.
- Compare names case-insensitively for likely duplicates.
- Detect names that differ only by case or repeated whitespace.

For example:

```text
Art Club
art club
Art  Club
Art Club
```

These should produce a warning and an interface for resolving them into one canonical club.

Do not automatically merge names where the intended result is ambiguous.

The allocation must not run while unresolved club-name conflicts remain.

## 13. Validation interface

After upload, display:

- File name
- File size
- Number of data rows
- Number of valid applications
- Number of invalid rows
- Number of unique clubs
- Number of applications with one choice
- Number of applications with two choices
- Number of applications with three choices
- A preview of the first several parsed rows

Display validation errors with:

- CSV row number
- Relevant child ID where available
- Field name
- Clear explanation
- Suggested correction

Examples:

```text
Row 14: duplicate id "kid_a8f2".
Row 21: choice_3 is present but choice_2 is blank.
Row 32: "Football" appears in both choice_1 and choice_2.
Row 41: timestamp is not a valid ISO date or timestamp.
```

Do not allow the lottery to run while validation errors remain.

Warnings may be accepted, but the administrator should explicitly review them.

## 14. Year eligibility

Year-based club eligibility is outside V1 because the agreed CSV format does not contain a year
column.

Clubstonbury should assume that:

- All submitted choices are eligible.
- Eligibility has already been validated by the system that generated the CSV.

Document this assumption clearly.

Do not infer a child’s year from their ID or other fields.

## 15. Club capacities

Infer the list of clubs from the uploaded choices.

Display an editable table such as:

| Club     | Applications | First choices | Capacity |
| -------- | -----------: | ------------: | -------: |
| Football |           42 |            25 |       20 |
| Drama    |           28 |            17 |       16 |
| Coding   |           19 |             7 |       12 |

Capacity must be a non-negative integer.

A capacity of zero is valid.

Provide ways to:

- Enter capacities individually
- Paste a two-column list of club names and capacities
- Set every club to the same initial capacity
- Clear all capacities

A pasted capacity list may use CSV or tab-separated values:

```text
Football	20
Drama	16
Coding	12
```

Report unknown club names, duplicate rows and invalid capacities.

Do not infer capacities automatically.

The allocation must not run until every discovered club has a valid capacity.

## 16. Fairness principles

The implementation should optimise for these principles:

1. Treat all on-time applicants equally.
2. Give children the opportunity to receive one club before allocating second clubs.
3. Allocate second clubs before allocating third clubs.
4. Respect each child’s submitted preference order.
5. Do not reward submitting fewer choices.
6. Do not penalise submitting backup choices.
7. Do not reward earlier submission within the application window.
8. Never allocate a child to a club they did not request.
9. Never exceed a club’s capacity.
10. Make every result reproducible and auditable.

## 17. Random seed

Every allocation run requires a seed.

By default, generate a cryptographically secure random seed in the browser using
`crypto.getRandomValues`.

Display the seed before running the lottery.

Allow the administrator to:

- Copy the seed
- Download it as part of the results
- Replace it with a custom seed
- Generate a new seed

The combination of:

- Input application data
- Club capacities
- Algorithm version
- Seed

must always produce exactly the same result.

Do not use `Math.random()`.

## 18. Deterministic lottery ordering

The allocation engine must not depend on CSV row order.

Generate a deterministic random priority for each child in each allocation round.

Conceptually:

```text
SHA-256(
  algorithm_version
  + ":"
  + seed
  + ":round:"
  + round_number
  + ":child:"
  + child_id
)
```

Convert the resulting digest into a value that can be sorted consistently.

Sort ascending by digest.

Use the child ID as a final deterministic tie-breaker, although equal cryptographic hashes should be
practically impossible.

Use a separate ordering for each round. A child who receives an early position in the first round
should not automatically receive an early position in later rounds.

## 19. Allocation algorithm

Each child may receive at most three clubs, because the input contains at most three choices.

The allocation occurs in three rounds.

### Round 1: first club

Every child begins with zero allocations.

Process all children in the deterministic round-one lottery order.

For each child, inspect their requested clubs in ranking order:

1. Try `choice_1`.
2. If it has no remaining capacity, try `choice_2`.
3. If it has no remaining capacity, try `choice_3`.
4. If none has capacity, allocate nothing.

Allocate no more than one club to a child during this round.

After every child has been processed, round one is complete.

### Round 2: second club

Only children who received exactly one club in round one are eligible to receive a second club.

Generate the deterministic round-two lottery order.

Process eligible children in that order.

For each child, inspect their choices in ranking order and allocate the highest-ranked club that:

- They requested
- They have not already received
- Still has capacity

Allocate no more than one additional club during this round.

Children who received no club in round one do not receive special priority during round two. By the
end of round one, all their requested clubs were already unavailable when their turn was processed.

They should instead appear on the relevant waiting lists.

### Round 3: third club

Only children who currently have exactly two allocations are eligible to receive a third club.

Generate the deterministic round-three lottery order.

For each eligible child, allocate their highest-ranked requested club that:

- They have not already received
- Still has capacity

Allocate no more than one additional club during this round.

## 20. Required algorithm properties

The implementation must guarantee:

- Submission timestamps do not affect the result.
- CSV row order does not affect the result.
- Capacities are never exceeded.
- A child is never allocated an unrequested club.
- A child never receives the same club twice.
- A child receives no more than one club in each round.
- A child receives no more than three clubs overall.
- Choices are always attempted in ranking order.
- A child is considered for one club before becoming eligible for a second.
- A child is considered for two clubs before becoming eligible for a third.
- Adding a lower-ranked choice cannot reduce that child’s chance of receiving a higher-ranked
  choice.
- Omitting lower-ranked choices cannot improve the child’s lottery position.
- Supplying one choice rather than three does not grant special priority.
- The same inputs and seed always generate the same output.

## 21. Why fewer choices are allowed

The CSV always contains three choice columns, but `choice_2` and `choice_3` may be blank.

Families should only list clubs they would genuinely accept.

Forcing families to select three clubs would create false demand and unnecessary refusals.

The algorithm must ensure that listing a backup cannot harm a child’s chance of receiving a
higher-ranked club.

For example:

```text
Child A: Football
Child B: Football, Drama, Coding
```

Child A and Child B should have the same lottery treatment when competing for Football.

Child B’s backup choices are considered only if Football is unavailable.

## 22. Waiting lists

Produce a deterministic waiting list for every club.

A child should appear on a club’s waiting list when:

- They requested the club
- They were not allocated the club

Do not place a child on the waiting list for a club they already received.

Waiting-list ordering should be generated deterministically for each club.

Conceptually:

```text
SHA-256(
  algorithm_version
  + ":"
  + seed
  + ":waitlist:"
  + canonical_club_name
  + ":child:"
  + child_id
)
```

Sort applicants by this digest.

Use the child ID as a final tie-breaker.

Do not determine waiting-list order using:

- Submission time
- Number of submitted choices
- Current allocation count
- Whether the club was first, second or third choice
- CSV row order

Include the original choice rank in the waiting-list output for information, but do not use it as
priority.

For example:

```text
club: Football
position: 4
id: kid_a8f2
original_choice_rank: 1
```

## 23. Refusals

Clubstonbury V1 does not need to track acceptances and refusals interactively.

Instead, the downloaded waiting lists should let an administrator re-offer a declined place
manually.

When a place is declined:

1. Find the relevant club’s waiting list.
2. Offer the place to the first remaining child.
3. Continue down the list until somebody accepts.
4. Do not reorder the waiting list.
5. Do not give late applicants priority over the original waiting list.

A child may hold at most three clubs.

Because each child submits at most three choices, they cannot already hold three clubs while waiting
for a fourth requested club.

## 24. Mop-up

Mop-up happens only after:

- Initial allocations have been offered
- Refusals have been processed
- Relevant original waiting lists have been exhausted

Mop-up may include:

- Late applicants
- Children who now want a club they did not originally choose
- Residual places in undersubscribed clubs

For V1, mop-up can be run as a separate Clubstonbury allocation using:

- A new CSV
- The remaining club capacities
- A new seed

The tool does not need to maintain a saved relationship between the original run and the mop-up run.

Explain this workflow in the interface and documentation.

## 25. Allocation review

Before running the lottery, show a review panel containing:

- Number of valid applications
- Number of clubs
- Total available places
- Club capacities
- Current random seed
- Algorithm version
- Confirmation that timestamps will not affect the result
- Confirmation that processing occurs locally

The primary action should be labelled clearly, for example:

> Run the Clubstonbury lottery

Do not use language implying that results are being uploaded or submitted.

## 26. Allocation results

After allocation, show:

- Total children
- Total available places
- Total places allocated
- Total unused places
- Children receiving no club
- Children receiving one club
- Children receiving two clubs
- Children receiving three clubs
- Children receiving their first choice
- Children receiving one of their submitted choices
- Number of clubs with waiting lists
- Number of clubs with remaining capacity

Include a club-level summary:

| Club     | Capacity | Allocated | Remaining | Waiting list |
| -------- | -------: | --------: | --------: | -----------: |
| Football |       20 |        20 |         0 |           22 |
| Drama    |       16 |        16 |         0 |           12 |
| Coding   |       12 |         9 |         3 |            0 |

Charts may be used, but all chart information must also be available as text or a table.

Use the festival-ticket visual language in the results, for example:

- “Tickets allocated”
- “Sold out”
- “Tickets remaining”
- “Waiting list”

Do not let playful copy make the meaning unclear.

## 27. Result downloads

Provide one main download:

```text
clubstonbury-results.zip
```

Generate the ZIP entirely in the browser.

It should contain:

```text
allocations.csv
club_summary.csv
waiting_lists.csv
unallocated.csv
run_manifest.json
```

### `allocations.csv`

Columns:

```csv
id,timestamp,choice_1,choice_2,choice_3,allocated_1,allocated_2,allocated_3,allocation_count,best_choice_received
```

Rules:

- `allocated_1`, `allocated_2` and `allocated_3` should be ordered by the child’s original
  preference rank, not necessarily allocation round.
- `allocation_count` should be `0`, `1`, `2` or `3`.
- `best_choice_received` should be `1`, `2`, `3` or blank.

### `club_summary.csv`

Columns:

```csv
club,capacity,allocated,remaining,applications,first_choice_applications,second_choice_applications,third_choice_applications,waiting_list_length
```

### `waiting_lists.csv`

Columns:

```csv
club,position,id,original_choice_rank,current_allocation_count
```

Sort by:

1. Club display name
2. Waiting-list position

### `unallocated.csv`

Include children who received no clubs.

Columns:

```csv
id,timestamp,choice_1,choice_2,choice_3
```

### `run_manifest.json`

Include:

```json
{
  "product": "Clubstonbury",
  "productVersion": "...",
  "algorithmVersion": "...",
  "seed": "...",
  "runTimestamp": "...",
  "inputCsvSha256": "...",
  "applicationCount": 0,
  "clubCount": 0,
  "totalCapacity": 0,
  "capacities": {},
  "validationWarnings": [],
  "timestampUsedForAllocation": false,
  "allocationRounds": 3
}
```

The run timestamp records when the administrator pressed the allocation button. It must not
influence the allocation.

## 28. CSV export safety

Protect CSV outputs against spreadsheet formula injection.

Any exported string cell beginning with one of these characters should be escaped safely:

```text
=
+
-
@
```

Do not corrupt legitimate negative numeric values generated by Clubstonbury.

Apply protection to user-supplied string values such as:

- IDs
- Timestamps where exported as text
- Club names
- Choice values

Use correct CSV quoting and escaping.

## 29. Auditability

The results must be independently reproducible.

The interface should explain that an administrator can reproduce a run using:

- The same source CSV
- The same capacities
- The same seed
- The same algorithm version

Include a copyable summary of these values.

Consider providing a small “Reproducing this lottery” section after results are generated.

Do not expose children’s IDs on the public explanatory page.

## 30. Offline support

Implement a SvelteKit service worker that caches:

- HTML application shell
- JavaScript bundles
- CSS
- Local fonts
- Local illustrations
- Icons
- Any libraries required for CSV parsing and ZIP creation

The complete allocation workflow should work offline after the first successful visit.

An end-to-end offline test should verify:

1. Load the deployed or preview site online.
2. Wait for service-worker activation.
3. Reload the site offline.
4. Navigate to `/allocate`.
5. Upload a fixture CSV.
6. Enter capacities.
7. Run the allocation.
8. Download the result ZIP.

Running an allocation must produce no network requests.

## 31. SPA and static-build configuration

Configure SvelteKit as a static SPA.

Use:

- `@sveltejs/adapter-static`
- Client-side rendering
- A fallback document such as `200.html`

Configure the root layout appropriately so pages can be loaded through the SPA fallback.

Directly visiting:

```text
/allocate
```

must work in production.

The generated static output should be written to:

```text
build/
```

## 32. Render deployment

Deploy as a Render Static Site.

Use:

```text
Build command: deno task build
Publish directory: build
```

Configure a rewrite so unknown routes use the SPA fallback:

```text
/*  /200.html  200
```

Use the exact Render configuration format appropriate to the chosen deployment method.

Provide either:

- A committed `render.yaml`, or
- Clear deployment instructions in the README

Do not require environment variables or secrets.

## 33. Suggested project structure

```text
clubstonbury/
├── .envrc
├── .gitignore
├── deno.json
├── deno.lock
├── flake.lock
├── flake.nix
├── package.json
├── README.md
├── render.yaml
├── svelte.config.js
├── vite.config.ts
├── src/
│   ├── app.html
│   ├── service-worker.ts
│   ├── lib/
│   │   ├── allocation/
│   │   │   ├── allocate.ts
│   │   │   ├── priority.ts
│   │   │   ├── waitlists.ts
│   │   │   ├── manifest.ts
│   │   │   └── types.ts
│   │   ├── csv/
│   │   │   ├── parse.ts
│   │   │   ├── validate.ts
│   │   │   ├── normalise.ts
│   │   │   ├── export.ts
│   │   │   └── formula-safety.ts
│   │   ├── components/
│   │   │   ├── AllocationSummary.svelte
│   │   │   ├── CapacityTable.svelte
│   │   │   ├── ClubSummaryTable.svelte
│   │   │   ├── CsvUploader.svelte
│   │   │   ├── FestivalTicket.svelte
│   │   │   ├── PrivacyNotice.svelte
│   │   │   ├── SeedControl.svelte
│   │   │   ├── StepIndicator.svelte
│   │   │   └── ValidationSummary.svelte
│   │   └── state/
│   │       └── allocation-state.svelte.ts
│   └── routes/
│       ├── +layout.ts
│       ├── +layout.svelte
│       ├── +page.svelte
│       └── allocate/
│           └── +page.svelte
├── static/
│   ├── icons/
│   ├── illustrations/
│   └── manifest.webmanifest
└── tests/
    ├── allocation/
    ├── csv/
    ├── fixtures/
    └── e2e/
```

Keep the allocation engine independent of Svelte.

Core functions should accept plain typed data and return plain typed results.

## 34. Suggested domain types

Use types similar to:

```ts
export type Application = {
  id: string;
  timestamp: string;
  choices: string[];
};

export type ClubCapacity = {
  club: string;
  capacity: number;
};

export type Allocation = {
  childId: string;
  clubs: string[];
};

export type WaitingListEntry = {
  club: string;
  position: number;
  childId: string;
  originalChoiceRank: 1 | 2 | 3;
  currentAllocationCount: number;
};

export type AllocationRunInput = {
  applications: Application[];
  capacities: Record<string, number>;
  seed: string;
  algorithmVersion: string;
};

export type AllocationRunResult = {
  allocations: Allocation[];
  waitingLists: WaitingListEntry[];
  remainingCapacities: Record<string, number>;
};
```

The exact types may differ, but the allocation engine should have an explicit input and output
contract.

## 35. Testing

Use Deno-compatible test tooling.

The core allocation logic requires comprehensive unit and property-style tests.

### Determinism

Test that:

- The same data, capacities, algorithm version and seed produce identical results.
- Reordering CSV rows does not change results.
- Changing timestamps does not change results.
- Reformatting timestamps to equivalent valid values does not change results.
- Waiting lists are deterministic.

### Capacity and allocation invariants

Test that:

- No club exceeds capacity.
- No child receives an unrequested club.
- No child receives a duplicate club.
- No child receives more than one club per round.
- No child receives more than three clubs.
- A capacity of zero produces no allocations for that club.
- Empty capacities are rejected before allocation.

### Ranking behaviour

Test that:

- The highest-ranked available choice is selected.
- A second choice is considered only when the first choice is unavailable or already allocated to
  that child.
- A third choice is considered only when higher choices are unavailable or already allocated.
- Adding a lower-ranked choice cannot remove an allocation of a higher-ranked choice for the same
  child under the same seed and other inputs.
- Leaving `choice_2` or `choice_3` blank does not change the child’s lottery priority.
- Listing only one choice does not provide priority over a child listing three.

### Round behaviour

Test that:

- Round one allocates at most one club per child.
- Only children with exactly one allocation enter round two.
- Only children with exactly two allocations enter round three.
- No second clubs are allocated until every child has been processed in round one.
- No third clubs are allocated until round two is complete.

### Waiting lists

Test that:

- Every unsuccessful request appears on the appropriate waiting list.
- Successful requests do not appear on that club’s waiting list.
- Choice rank is included but does not control priority.
- Timestamps do not affect waiting-list order.
- CSV row order does not affect waiting-list order.

### CSV validation

Test:

- Missing columns
- Duplicate IDs
- Blank IDs
- Invalid timestamps
- Missing first choices
- Non-contiguous choices
- Duplicate choices
- Quoted commas
- Quoted line breaks
- UTF-8 club names
- Byte-order marks
- Empty rows
- Additional columns
- Case and whitespace club-name conflicts

### CSV export

Test:

- Correct quoting
- Embedded commas
- Embedded quotes
- Embedded newlines
- UTF-8 values
- Spreadsheet formula-injection protection
- Stable column order
- Stable row sorting

### End-to-end tests

Include an end-to-end test that:

1. Opens the home page.
2. Navigates to `/allocate`.
3. Uploads a fixture CSV.
4. Reviews the validation summary.
5. Enters capacities.
6. Sets a known seed.
7. Runs the allocation.
8. Verifies the summary.
9. Downloads the ZIP.
10. Checks that expected files are present.

Include a second end-to-end test for offline operation.

## 36. Accessibility

Target WCAG 2.2 AA.

Requirements:

- Full keyboard operation
- Semantic headings
- Properly associated form labels
- Visible focus indicators
- Accessible file-upload control
- Accessible tables
- Error summaries linked to relevant inputs
- Screen-reader announcements when validation finishes
- Screen-reader announcement when allocation finishes
- Sufficient colour contrast
- No information conveyed by colour alone
- No drag-and-drop-only interactions
- No animation required to understand the algorithm
- Respect `prefers-reduced-motion`
- Charts accompanied by text or tables
- Sensible focus management between workflow stages

Use native HTML elements wherever possible.

## 37. Responsive design

The site should work on:

- Desktop
- Tablet
- Mobile

The capacity table may become a series of cards on narrow screens.

Do not require horizontal scrolling for the primary workflow where it can reasonably be avoided.

Large results tables may use accessible horizontal scrolling.

## 38. Content tone

Use plain English.

Prefer:

> Everyone who applies before the deadline enters the same lottery.

Avoid:

> Candidate applications are assigned stochastically using a deterministic pseudorandom selection
> process.

Explain technical audit details separately for administrators who want them.

The tone can use light festival language, but should remain precise.

Examples:

- “Choose the lineup”
- “Run the lottery”
- “Tickets allocated”
- “Sold out”
- “Waiting list”
- “Tickets remaining”

Avoid jokes in error messages or situations where clarity matters.

## 39. Documentation

The README should contain:

- Product overview
- Fairness principles
- Exact allocation algorithm
- Waiting-list behaviour
- Privacy model
- Offline behaviour
- CSV format
- Example CSV
- Development prerequisites
- direnv setup
- Deno commands
- Test commands
- Static build instructions
- Render deployment instructions
- Reproduction instructions
- V1 limitations

Clearly state:

> Clubstonbury does not determine whether a child is eligible for a club. The uploaded choices must
> already have been validated for eligibility.

Also state:

> Clubstonbury does not use submission timestamps to rank applications.

## 40. V1 non-goals

Do not implement:

- Accounts
- Authentication
- Child names or personal profiles
- A database
- Server-side file processing
- Server-side allocation
- Email notifications
- Automatic acceptance collection
- Automatic refusal processing
- Interactive waiting-list management
- Saved allocation projects
- Multiple schools
- Year-based eligibility
- First-come-first-served allocation
- Timestamp weighting
- Priority groups
- Sibling preferences
- Special educational needs prioritisation
- Staff overrides
- Statistical estimates of an individual child’s probability
- Automatic merging of ambiguous club names

The code should not make these impossible to add later, but V1 should remain focused.

## 41. Definition of done

The project is complete when:

- `direnv allow` activates a working Nix development environment.
- `deno task dev` starts the SvelteKit development server.
- `deno task check` passes.
- `deno task lint` passes.
- `deno task test` passes.
- `deno task test:e2e` passes.
- `deno task build` creates a static SPA in `build/`.
- The home page explains the algorithm accessibly.
- The allocation page accepts and validates the specified CSV.
- Capacities can be entered for every discovered club.
- A deterministic three-round allocation can be run.
- Waiting lists are generated.
- Results can be downloaded as a ZIP.
- No application data leaves the browser.
- The application works offline after its first load.
- Direct navigation to `/allocate` works on Render.
- The visual design clearly communicates the Clubstonbury family-festival concept.
- The same inputs and seed reproduce the same result.
