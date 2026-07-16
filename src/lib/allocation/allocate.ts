import { clubComparisonKey, compareText } from '../csv/normalise.ts';
import { deterministicOrder } from './priority.ts';
import type {
  AllocationEvent,
  AllocationRunInput,
  AllocationRunResult,
  Application,
  WaitingListEntry,
} from './types.ts';

function assertInput(input: AllocationRunInput): void {
  if (!input.seed.trim()) throw new Error('A random seed is required.');
  const discovered = new Set(input.applications.flatMap((application) => application.choices));
  for (const club of discovered) {
    const capacity = input.capacities[club];
    if (!Number.isInteger(capacity) || capacity < 0) {
      throw new Error(`A non-negative integer capacity is required for ${club}.`);
    }
  }
}

async function buildWaitingLists(
  applications: Application[],
  allocatedByChild: Map<string, string[]>,
  algorithmVersion: string,
  seed: string,
): Promise<WaitingListEntry[]> {
  const clubs = [...new Set(applications.flatMap((application) => application.choices))].sort(
    compareText,
  );
  const entries: WaitingListEntry[] = [];
  for (const club of clubs) {
    const candidates = applications.filter((application) =>
      application.choices.includes(club) &&
      !(allocatedByChild.get(application.id) ?? []).includes(club)
    );
    const order = await deterministicOrder(
      candidates.map((candidate) => candidate.id),
      `${algorithmVersion}:${seed}:waitlist:${clubComparisonKey(club)}`,
    );
    const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
    order.forEach((childId, index) => {
      const application = byId.get(childId)!;
      entries.push({
        club,
        position: index + 1,
        childId,
        originalChoiceRank: (application.choices.indexOf(club) + 1) as 1 | 2 | 3,
        currentAllocationCount: allocatedByChild.get(childId)?.length ?? 0,
      });
    });
  }
  return entries;
}

export async function runAllocation(input: AllocationRunInput): Promise<AllocationRunResult> {
  assertInput(input);
  const applicationsById = new Map(
    input.applications.map((application) => [application.id, application]),
  );
  const allocatedByChild = new Map(
    input.applications.map((application) => [application.id, [] as string[]]),
  );
  const remainingCapacities = { ...input.capacities };
  const events: AllocationEvent[] = [];

  for (const round of [1, 2, 3] as const) {
    const eligible = input.applications.filter((application) =>
      round === 1 || (allocatedByChild.get(application.id)?.length ?? 0) === round - 1
    );
    const order = await deterministicOrder(
      eligible.map((application) => application.id),
      `${input.algorithmVersion}:${input.seed}:round:${round}`,
    );
    for (const childId of order) {
      const application = applicationsById.get(childId)!;
      const existing = allocatedByChild.get(childId)!;
      const club = application.choices.find((choice) =>
        !existing.includes(choice) && (remainingCapacities[choice] ?? 0) > 0
      );
      if (!club) continue;
      existing.push(club);
      remainingCapacities[club] -= 1;
      events.push({ childId, club, round });
    }
  }

  const allocations = [...allocatedByChild.entries()]
    .sort(([a], [b]) => compareText(a, b))
    .map(([childId, clubs]) => ({ childId, clubs }));
  const waitingLists = await buildWaitingLists(
    input.applications,
    allocatedByChild,
    input.algorithmVersion,
    input.seed,
  );
  return { allocations, events, waitingLists, remainingCapacities };
}
