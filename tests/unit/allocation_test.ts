import assert from 'node:assert/strict';
import { runAllocation } from '../../src/lib/allocation/allocate.ts';
import type { AllocationRunInput, Application } from '../../src/lib/allocation/types.ts';

const applications: Application[] = [
  { id: 'a', timestamp: '2026-01-01T09:00:00Z', choices: ['Football', 'Drama', 'Art'] },
  { id: 'b', timestamp: '2026-01-02T09:00:00Z', choices: ['Football'] },
  { id: 'c', timestamp: '2026-01-03T09:00:00Z', choices: ['Drama', 'Football'] },
  { id: 'd', timestamp: '2026-01-04T09:00:00Z', choices: ['Art', 'Drama'] },
];

function input(overrides: Partial<AllocationRunInput> = {}): AllocationRunInput {
  return {
    applications,
    capacities: { Football: 1, Drama: 2, Art: 1 },
    seed: 'known-seed',
    algorithmVersion: 'v1',
    ...overrides,
  };
}

Deno.test('allocation is deterministic and independent of CSV order and timestamps', async () => {
  const first = await runAllocation(input());
  const repeat = await runAllocation(input());
  assert.deepEqual(first, repeat);
  const reordered = applications.toReversed().map((application) => ({
    ...application,
    timestamp: '2030-12-31T23:59:59Z',
  }));
  assert.deepEqual(await runAllocation(input({ applications: reordered })), first);
});

Deno.test('capacity, request, uniqueness and round invariants hold', async () => {
  const result = await runAllocation(input());
  for (const [club, capacity] of Object.entries(input().capacities)) {
    assert.ok(
      result.allocations.filter((allocation) => allocation.clubs.includes(club)).length <= capacity,
    );
  }
  for (const allocation of result.allocations) {
    const requested = applications.find((application) =>
      application.id === allocation.childId
    )!.choices;
    assert.ok(allocation.clubs.every((club) => requested.includes(club)));
    assert.equal(new Set(allocation.clubs).size, allocation.clubs.length);
    assert.ok(allocation.clubs.length <= 3);
  }
  for (const round of [1, 2, 3]) {
    const events = result.events.filter((event) => event.round === round);
    assert.equal(new Set(events.map((event) => event.childId)).size, events.length);
  }
});

Deno.test('zero capacity allocates no places and missing capacities are rejected', async () => {
  const result = await runAllocation(input({ capacities: { Football: 0, Drama: 0, Art: 0 } }));
  assert.ok(result.allocations.every((allocation) => allocation.clubs.length === 0));
  await assert.rejects(
    () => runAllocation(input({ capacities: { Football: 1 } })),
    /capacity is required/,
  );
});

Deno.test('children receive the highest-ranked available choice in each round', async () => {
  const one: Application[] = [{
    id: 'a',
    timestamp: '2026-01-01',
    choices: ['Full', 'Open', 'Third'],
  }];
  const result = await runAllocation(
    input({ applications: one, capacities: { Full: 0, Open: 1, Third: 1 } }),
  );
  assert.deepEqual(result.allocations[0].clubs, ['Open', 'Third']);
  assert.deepEqual(result.events.map((event) => event.round), [1, 2]);
});

Deno.test('adding a lower choice cannot remove the same child higher-choice allocation', async () => {
  const withoutBackup = applications.map((application) =>
    application.id === 'b' ? { ...application, choices: ['Football'] } : application
  );
  const withBackup = applications.map((application) =>
    application.id === 'b' ? { ...application, choices: ['Football', 'Drama', 'Art'] } : application
  );
  const first = await runAllocation(input({ applications: withoutBackup }));
  const second = await runAllocation(input({ applications: withBackup }));
  const firstClubs = first.allocations.find((allocation) => allocation.childId === 'b')!.clubs;
  const secondClubs = second.allocations.find((allocation) => allocation.childId === 'b')!.clubs;
  assert.equal(firstClubs.includes('Football'), secondClubs.includes('Football'));
});

Deno.test('waiting lists contain every unsuccessful request with deterministic neutral ordering', async () => {
  const first = await runAllocation(input());
  const changedTimes = applications.map((application) => ({
    ...application,
    timestamp: '2040-01-01',
  }));
  const second = await runAllocation(input({ applications: changedTimes.toReversed() }));
  assert.deepEqual(first.waitingLists, second.waitingLists);
  for (const application of applications) {
    const allocated = first.allocations.find((item) => item.childId === application.id)!.clubs;
    for (const [index, club] of application.choices.entries()) {
      const entry = first.waitingLists.find((item) =>
        item.childId === application.id && item.club === club
      );
      assert.equal(!!entry, !allocated.includes(club));
      if (entry) assert.equal(entry.originalChoiceRank, index + 1);
    }
  }
});
