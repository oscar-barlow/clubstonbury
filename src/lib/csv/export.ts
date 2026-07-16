import { strToU8, zipSync } from 'fflate';
import type {
  AllocationRunInput,
  AllocationRunResult,
  ClubSummary,
  RunManifest,
} from '../allocation/types.ts';
import { compareText } from './normalise.ts';
import { safeSpreadsheetString } from './formula-safety.ts';

type CsvCell = string | number | null | undefined;

function encodeCell(cell: CsvCell): string {
  const value = typeof cell === 'string' ? safeSpreadsheetString(cell) : String(cell ?? '');
  return /[",\r\n]/u.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function createCsv(headers: string[], rows: CsvCell[][]): string {
  return `${[headers, ...rows].map((row) => row.map(encodeCell).join(',')).join('\r\n')}\r\n`;
}

export function buildResultFiles(
  input: AllocationRunInput,
  result: AllocationRunResult,
  summaries: ClubSummary[],
  manifest: RunManifest,
): Record<string, string> {
  const allocationByChild = new Map(
    result.allocations.map((allocation) => [allocation.childId, allocation]),
  );
  const applications = [...input.applications].sort((a, b) => compareText(a.id, b.id));
  const allocations = createCsv(
    [
      'id',
      'timestamp',
      'choice_1',
      'choice_2',
      'choice_3',
      'allocated_1',
      'allocated_2',
      'allocated_3',
      'allocation_count',
      'best_choice_received',
    ],
    applications.map((application) => {
      const received = allocationByChild.get(application.id)?.clubs ?? [];
      const ordered = application.choices.filter((choice) => received.includes(choice));
      const best = ordered.length ? application.choices.indexOf(ordered[0]) + 1 : '';
      return [
        application.id,
        application.timestamp,
        application.choices[0] ?? '',
        application.choices[1] ?? '',
        application.choices[2] ?? '',
        ordered[0] ?? '',
        ordered[1] ?? '',
        ordered[2] ?? '',
        ordered.length,
        best,
      ];
    }),
  );
  const clubSummary = createCsv(
    [
      'club',
      'capacity',
      'allocated',
      'remaining',
      'applications',
      'first_choice_applications',
      'second_choice_applications',
      'third_choice_applications',
      'waiting_list_length',
    ],
    summaries.map((summary) => [
      summary.club,
      summary.capacity,
      summary.allocated,
      summary.remaining,
      summary.applications,
      summary.firstChoiceApplications,
      summary.secondChoiceApplications,
      summary.thirdChoiceApplications,
      summary.waitingListLength,
    ]),
  );
  const waitingLists = createCsv(
    ['club', 'position', 'id', 'original_choice_rank', 'current_allocation_count'],
    [...result.waitingLists]
      .sort((a, b) => compareText(a.club, b.club) || a.position - b.position)
      .map((
        entry,
      ) => [
        entry.club,
        entry.position,
        entry.childId,
        entry.originalChoiceRank,
        entry.currentAllocationCount,
      ]),
  );
  const unallocated = createCsv(
    ['id', 'timestamp', 'choice_1', 'choice_2', 'choice_3'],
    applications.filter((application) =>
      !(allocationByChild.get(application.id)?.clubs.length ?? 0)
    )
      .map((application) => [
        application.id,
        application.timestamp,
        application.choices[0] ?? '',
        application.choices[1] ?? '',
        application.choices[2] ?? '',
      ]),
  );
  return {
    'allocations.csv': allocations,
    'club_summary.csv': clubSummary,
    'waiting_lists.csv': waitingLists,
    'unallocated.csv': unallocated,
    'run_manifest.json': `${JSON.stringify(manifest, null, 2)}\n`,
  };
}

export function createResultZip(files: Record<string, string>): Uint8Array {
  return zipSync(
    Object.fromEntries(Object.entries(files).map(([name, value]) => [name, strToU8(value)])),
    {
      level: 6,
    },
  );
}

export function resultArchiveName(runTimestamp: string, seed: string): string {
  const stamp = new Date(runTimestamp).toISOString().replace(/[-:]/gu, '').replace(
    /\.\d{3}Z$/u,
    'Z',
  )
    .replace('T', '-');
  const safeSeed = seed.trim().replace(/[^a-zA-Z0-9_-]+/gu, '-').replace(/^-+|-+$/gu, '')
    .slice(0, 64) || 'custom-seed';
  return `clubstonbury-results-${stamp}-${safeSeed}.zip`;
}
