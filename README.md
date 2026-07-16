# Clubstonbury

A calmer, private way for schools to allocate after-school club places.

Clubstonbury is a browser-only SvelteKit application that allocates limited club places through a
transparent, reproducible lottery. Families may rank one to three clubs. Every on-time application
is treated equally, and each child is considered for one club before anyone is considered for a
second or third.

## Fairness model

Clubstonbury follows these rules:

1. Every valid application in the source CSV enters the same lottery.
2. Submission timestamps are preserved but never used to rank applications.
3. Round one considers every child for at most one club, trying their choices in rank order.
4. Round two considers children who received exactly one club for one more club.
5. Round three considers children who received exactly two clubs for one more club.
6. A child is never allocated an unrequested club and club capacity is never exceeded.
7. Lower-ranked choices cannot reduce the chance of receiving a higher-ranked choice.

For each round, the app sorts children by the SHA-256 digest of:

```text
<algorithm_version>:<seed>:round:<round_number>:child:<child_id>
```

`round` and `child` are fixed namespace labels; they are not application data. The values are the
algorithm version, seed, round number and opaque child ID. For example:

```text
clubstonbury-v1:seed123:round:1:child:kid_7f3a91c2
```

The child ID is also the final tie-breaker if two SHA-256 digests are equal. Because timestamps,
choice count and CSV row order are absent from this value, none can change a child’s lottery
position.

## Waiting lists and mop-up

Every unsuccessful request appears on that club's waiting list. Each club uses its own deterministic
SHA-256 ordering based on the algorithm version, seed, canonical club name and child ID. Choice
rank, submission time and current allocation count are included only as information or omitted from
the priority calculation.

When a place is declined, work down the original waiting list without reordering it. Only after the
original list is exhausted should remaining places enter mop-up. Mop-up is first come, first served:
offer places to late applicants or children making new choices in the order they apply.

## Privacy and offline use

Application and capacity files are parsed in browser memory. No uploaded data, allocation result or
generated file is sent to a server or written to browser storage. The app contains no accounts,
cookies, analytics, error reporting, remote fonts, remote images or tracking. **Clear all data**
removes the loaded files, parsed records, capacities, results and archive from memory.

The first visit downloads the static app. Its service worker caches the application shell and local
assets. Once cached, both routes and the complete allocation/download workflow work offline. The
service worker never receives or caches uploaded file contents or results.

## Input files

The application CSV requires these case-sensitive columns:

```csv
id,timestamp,choice_1,choice_2,choice_3
kid_a8f2,2026-09-01T14:23:00Z,Football,Drama,Coding
kid_b129,2026-09-02T09:05:00Z,Drama,Art,
kid_c731,2026-09-03T18:42:00Z,Football,,
```

`id` must be a unique opaque identifier, not a child name. `choice_1` is required; later choices are
optional and contiguous. Additional columns generate a reviewable warning. Quoted fields, embedded
commas and lines, UTF-8, BOMs and common line endings are supported.

Capacities can be typed, set uniformly, pasted or uploaded as a separate CSV/TSV file. The capacity
file has two columns and may include a header:

```csv
club,capacity
Football,20
Drama,16
Coding,12
```

A capacity is a non-negative integer, including zero. Club names must match discovered names
case-insensitively. Unknown clubs, duplicates and invalid values block the import.

> Clubstonbury does not determine whether a child is eligible for a club. The uploaded choices must
> already have been validated for eligibility.

> Clubstonbury does not use submission timestamps to rank applications.

## Results and reproduction

The timestamped `clubstonbury-results-YYYYMMDD-HHMMSSZ-SEED.zip` archive contains:

- `allocations.csv`
- `club_summary.csv`
- `waiting_lists.csv`
- `unallocated.csv`
- `run_manifest.json`

User-controlled strings are protected against spreadsheet formula injection. To reproduce a run, use
the same source CSV, capacities, seed and algorithm version. The manifest records those values, the
source CSV SHA-256 digest and the run timestamp. The timestamp records when the lottery button was
pressed but does not influence the result.

## Development environment

One-time prerequisites:

1. Install Nix with flakes enabled.
2. Install direnv and add its hook to your shell.
3. Preferably install and configure nix-direnv.
4. Run `direnv allow` in this repository.

Entering the directory then activates the pinned Nix shell automatically. It provides the exact Deno
release and archive hash declared in `versions.json`, plus Git and a predictable UTF-8 locale.
Node.js, npm, Yarn and pnpm are not part of the local workflow. Dependencies are installed and
locked through Deno's npm compatibility layer.

```sh
git clone https://github.com/oscar-barlow/clubstonbury.git
cd clubstonbury
direnv allow
deno task dev
```

Available commands:

```sh
deno task dev       # development server
deno task check     # Svelte and TypeScript checks
deno task test      # unit and integration tests
deno task coverage  # core-module coverage report
deno task test:e2e  # production-build browser and offline tests
deno task guides    # regenerate the two printable PDF guides
deno task build     # static SPA in build/
deno task preview   # preview the static build
deno task fmt       # format source and documentation
deno task lint      # Deno lint
```

## Static deployment

`deno task build` uses `@sveltejs/adapter-static`, disables server rendering and creates `build/`
with `200.html` as its SPA fallback. The committed `render.yaml` configures a Render Static Site
with:

```text
Build command: npm install && node ./node_modules/.bin/vite build
Publish directory: build
Rewrite: /* -> /200.html (200)
```

Render uses its Node/npm runtime for this deployment build, matching the Infrux deployment pattern;
it does not need Deno or Nix. Local development and CI continue to use the pinned Deno/Nix workflow.
No environment variables or secrets are required.

Render pull request previews are enabled in `render.yaml`. The cache-free GitHub Actions workflow in
`.github/workflows/ci.yml` runs formatting, lint, Svelte/TypeScript checks, unit and integration
tests, the static build, and Chromium browser/offline tests whenever a pull request is opened or
updated.

## Demo and manual test data

The `/demo` page provides a synthetic 18-application dataset and matching capacity file for a quick
practice run. These downloads are bundled with the static app and contain no real child data.

A separate, larger manual test pack is committed under `tests/manual/`:

- `manual-applications.csv` contains 30 valid synthetic applications.
- `manual-capacities.csv` contains matching capacities.
- `manual-invalid-applications.csv` intentionally contains duplicate IDs, invalid timestamps,
  missing and non-contiguous choices, and a repeated club choice.

The downloadable and manual datasets are validated as part of `deno task test`.

## V1 limitations

V1 does not provide accounts, saved projects, eligibility checks, priority groups, acceptance or
refusal tracking, email, year handling, staff overrides or interactive waiting-list management. Late
applications and residual places are handled through first-come, first-served mop-up after the
original waiting lists are exhausted.

## License

Clubstonbury is open-source software licensed under the [MIT License](LICENSE).
