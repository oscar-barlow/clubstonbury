import { clubComparisonKey } from '../csv/normalise.ts';
import type { CapacityImportRow } from '../csv/parse.ts';

export function validateCapacityImport(rows: CapacityImportRow[], clubs: string[]): {
  values: Record<string, number>;
  errors: string[];
} {
  const known = new Map(clubs.map((club) => [clubComparisonKey(club), club]));
  const seen = new Set<string>();
  const values: Record<string, number> = {};
  const errors: string[] = [];
  for (const row of rows) {
    const key = clubComparisonKey(row.club);
    const club = known.get(key);
    if (!row.club) {
      errors.push(`Row ${row.row}: club name is blank.`);
      continue;
    }
    if (!club) {
      errors.push(`Row ${row.row}: unknown club "${row.club}".`);
      continue;
    }
    if (seen.has(key)) {
      errors.push(`Row ${row.row}: duplicate capacity for "${row.club}".`);
      continue;
    }
    seen.add(key);
    if (!/^\d+$/u.test(row.capacity)) {
      errors.push(`Row ${row.row}: capacity for "${row.club}" must be a non-negative integer.`);
      continue;
    }
    values[club] = Number(row.capacity);
  }
  return { values, errors };
}
