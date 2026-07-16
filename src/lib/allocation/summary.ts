import { compareText } from '../csv/normalise.ts';
import type { AllocationRunInput, AllocationRunResult, ClubSummary } from './types.ts';

export function buildClubSummaries(
  input: AllocationRunInput,
  result: AllocationRunResult,
): ClubSummary[] {
  return Object.keys(input.capacities).sort(compareText).map((club) => ({
    club,
    capacity: input.capacities[club],
    allocated: result.allocations.filter((allocation) => allocation.clubs.includes(club)).length,
    remaining: result.remainingCapacities[club],
    applications:
      input.applications.filter((application) => application.choices.includes(club)).length,
    firstChoiceApplications:
      input.applications.filter((application) => application.choices[0] === club).length,
    secondChoiceApplications:
      input.applications.filter((application) => application.choices[1] === club).length,
    thirdChoiceApplications:
      input.applications.filter((application) => application.choices[2] === club).length,
    waitingListLength: result.waitingLists.filter((entry) => entry.club === club).length,
  }));
}

export function allocationMetrics(input: AllocationRunInput, result: AllocationRunResult) {
  const counts = [0, 1, 2, 3].map((count) =>
    result.allocations.filter((allocation) => allocation.clubs.length === count).length
  );
  return {
    totalChildren: input.applications.length,
    totalCapacity: Object.values(input.capacities).reduce((sum, capacity) => sum + capacity, 0),
    totalAllocated: result.allocations.reduce(
      (sum, allocation) => sum + allocation.clubs.length,
      0,
    ),
    totalUnused: Object.values(result.remainingCapacities).reduce(
      (sum, capacity) => sum + capacity,
      0,
    ),
    noClub: counts[0],
    oneClub: counts[1],
    twoClubs: counts[2],
    threeClubs: counts[3],
    firstChoice: result.allocations.filter((allocation) => {
      const application = input.applications.find((candidate) =>
        candidate.id === allocation.childId
      )!;
      return allocation.clubs.includes(application.choices[0]);
    }).length,
    anyChoice: result.allocations.filter((allocation) => allocation.clubs.length > 0).length,
    clubsWithWaitingLists: new Set(result.waitingLists.map((entry) => entry.club)).size,
    clubsWithRemainingCapacity:
      Object.values(result.remainingCapacities).filter((capacity) => capacity > 0).length,
  };
}
