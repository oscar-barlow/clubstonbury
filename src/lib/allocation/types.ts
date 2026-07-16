export const PRODUCT_VERSION = '1.0.0';
export const ALGORITHM_VERSION = 'clubstonbury-v1';

export type Application = {
  id: string;
  timestamp: string;
  choices: string[];
  sourceRow?: number;
};

export type AllocationEvent = {
  childId: string;
  club: string;
  round: 1 | 2 | 3;
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
  events: AllocationEvent[];
  waitingLists: WaitingListEntry[];
  remainingCapacities: Record<string, number>;
};

export type ClubSummary = {
  club: string;
  capacity: number;
  allocated: number;
  remaining: number;
  applications: number;
  firstChoiceApplications: number;
  secondChoiceApplications: number;
  thirdChoiceApplications: number;
  waitingListLength: number;
};

export type RunManifest = {
  product: 'Clubstonbury';
  productVersion: string;
  algorithmVersion: string;
  seed: string;
  runTimestamp: string;
  inputCsvSha256: string;
  applicationCount: number;
  clubCount: number;
  totalCapacity: number;
  capacities: Record<string, number>;
  validationWarnings: string[];
  timestampUsedForAllocation: false;
  allocationRounds: 3;
};
