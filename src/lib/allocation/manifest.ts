import { sha256 } from './priority.ts';
import { type AllocationRunInput, PRODUCT_VERSION, type RunManifest } from './types.ts';

export async function createRunManifest(options: {
  input: AllocationRunInput;
  inputCsv: string;
  runTimestamp: string;
  warnings: string[];
}): Promise<RunManifest> {
  const { input, inputCsv, runTimestamp, warnings } = options;
  return {
    product: 'Clubstonbury',
    productVersion: PRODUCT_VERSION,
    algorithmVersion: input.algorithmVersion,
    seed: input.seed,
    runTimestamp,
    inputCsvSha256: await sha256(inputCsv.replace(/\r\n?/gu, '\n')),
    applicationCount: input.applications.length,
    clubCount: Object.keys(input.capacities).length,
    totalCapacity: Object.values(input.capacities).reduce((sum, capacity) => sum + capacity, 0),
    capacities: { ...input.capacities },
    validationWarnings: warnings,
    timestampUsedForAllocation: false,
    allocationRounds: 3,
  };
}
