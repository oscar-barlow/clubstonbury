import type { Application } from '../allocation/types.ts';
import { clubComparisonKey, displayClubName } from './normalise.ts';
import { type ParsedCsv, REQUIRED_COLUMNS } from './parse.ts';

export type ValidationIssue = {
  severity: 'error' | 'warning';
  row?: number;
  childId?: string;
  field?: string;
  message: string;
  correction?: string;
};

export type ClubConflict = {
  key: string;
  variants: string[];
};

export type ValidationResult = {
  applications: Application[];
  issues: ValidationIssue[];
  clubs: string[];
  conflicts: ClubConflict[];
  rowCount: number;
};

function validIsoTimestamp(value: string): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/u.test(
      value,
    )
  ) {
    return false;
  }
  if (Number.isNaN(Date.parse(value))) return false;
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

export function validateApplications(parsed: ParsedCsv): ValidationResult {
  const issues: ValidationIssue[] = parsed.parseErrors.map((error) => ({
    severity: 'error',
    row: error.row,
    message: `CSV could not be parsed: ${error.message}`,
    correction: 'Check quotes, commas and line breaks on this row.',
  }));
  const missing = REQUIRED_COLUMNS.filter((column) => !parsed.headers.includes(column));
  const extra = parsed.headers.filter((column) =>
    !(REQUIRED_COLUMNS as readonly string[]).includes(column)
  );
  if (missing.length) {
    issues.push({
      severity: 'error',
      field: 'columns',
      message: `Missing required ${missing.length === 1 ? 'column' : 'columns'}: ${
        missing.join(', ')
      }.`,
      correction: `Use these case-sensitive headings: ${REQUIRED_COLUMNS.join(', ')}.`,
    });
  }
  if (extra.length) {
    issues.push({
      severity: 'warning',
      field: 'columns',
      message: `Additional ${extra.length === 1 ? 'column' : 'columns'} will be ignored: ${
        extra.join(', ')
      }.`,
      correction: 'Review this warning, or remove the extra columns before uploading.',
    });
  }

  const seenIds = new Map<string, number>();
  const applications: Application[] = [];
  const clubVariants = new Map<string, Set<string>>();

  for (const row of parsed.rows) {
    const rowIssues: ValidationIssue[] = [];
    const id = row.id?.trim() ?? '';
    const timestamp = row.timestamp?.trim() ?? '';
    const rawChoices = [row.choice_1, row.choice_2, row.choice_3].map((value) =>
      value?.trim() ?? ''
    );
    const context = { row: row.__row, childId: id || undefined };

    if (!id) {
      rowIssues.push({
        severity: 'error',
        ...context,
        field: 'id',
        message: 'Child ID is blank.',
        correction: 'Provide a unique opaque child ID.',
      });
    } else if (seenIds.has(id)) {
      rowIssues.push({
        severity: 'error',
        ...context,
        field: 'id',
        message: `Duplicate id "${id}"; first used on row ${seenIds.get(id)}.`,
        correction: 'Give each application a unique ID.',
      });
    } else {
      seenIds.set(id, row.__row);
    }

    if (!validIsoTimestamp(timestamp)) {
      rowIssues.push({
        severity: 'error',
        ...context,
        field: 'timestamp',
        message: 'Timestamp is not a valid ISO date or timestamp.',
        correction: 'Use a value such as 2026-09-01T14:23:00Z.',
      });
    }
    if (!rawChoices[0]) {
      rowIssues.push({
        severity: 'error',
        ...context,
        field: 'choice_1',
        message: 'First choice is blank.',
        correction: 'Provide at least one club choice.',
      });
    }
    if (rawChoices[2] && !rawChoices[1]) {
      rowIssues.push({
        severity: 'error',
        ...context,
        field: 'choice_3',
        message: 'choice_3 is present but choice_2 is blank.',
        correction: 'Move the third choice to choice_2 or add a second choice.',
      });
    }

    const nonEmptyChoices = rawChoices.filter(Boolean).map(displayClubName);
    const duplicateChoice = nonEmptyChoices.find((choice, index) =>
      nonEmptyChoices.findIndex((candidate) =>
        clubComparisonKey(candidate) === clubComparisonKey(choice)
      ) !== index
    );
    if (duplicateChoice) {
      rowIssues.push({
        severity: 'error',
        ...context,
        field: 'choices',
        message: `"${duplicateChoice}" appears more than once in this application.`,
        correction: 'List each club only once.',
      });
    }

    issues.push(...rowIssues);
    if (rowIssues.some((issue) => issue.severity === 'error')) continue;

    const choices = nonEmptyChoices;
    applications.push({ id, timestamp, choices, sourceRow: row.__row });
    for (let index = 0; index < choices.length; index += 1) {
      const original = rawChoices[index];
      const key = clubComparisonKey(original);
      const variants = clubVariants.get(key) ?? new Set<string>();
      variants.add(original);
      clubVariants.set(key, variants);
    }
  }

  const conflicts = [...clubVariants.entries()]
    .filter(([, variants]) => variants.size > 1)
    .map(([key, variants]) => ({ key, variants: [...variants].sort() }));
  for (const conflict of conflicts) {
    issues.push({
      severity: 'warning',
      field: 'club names',
      message: `Likely duplicate club names need review: ${
        conflict.variants.map((name) => `"${name}"`).join(', ')
      }.`,
      correction: 'Choose one display name before running the lottery.',
    });
  }

  const clubs = [...new Set(applications.flatMap((application) => application.choices))].sort();
  return { applications, issues, clubs, conflicts, rowCount: parsed.rows.length };
}

export function resolveClubNames(
  applications: Application[],
  resolutions: Record<string, string>,
): Application[] {
  return applications.map((application) => ({
    ...application,
    choices: application.choices.map((choice) => resolutions[clubComparisonKey(choice)] ?? choice),
  }));
}
