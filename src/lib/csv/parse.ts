import Papa from 'papaparse';

export const REQUIRED_COLUMNS = ['id', 'timestamp', 'choice_1', 'choice_2', 'choice_3'] as const;

export type RawApplicationRow = {
  __row: number;
  id?: string;
  timestamp?: string;
  choice_1?: string;
  choice_2?: string;
  choice_3?: string;
  [key: string]: string | number | undefined;
};

export type ParsedCsv = {
  headers: string[];
  rows: RawApplicationRow[];
  parseErrors: Array<{ row: number; message: string }>;
};

export function parseApplicationCsv(source: string): ParsedCsv {
  const cleanSource = source.replace(/^\uFEFF/u, '').replace(/\r\n?/gu, '\n');
  const result = Papa.parse<Record<string, string>>(cleanSource, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.replace(/^\uFEFF/u, ''),
    transform: (value) => value.trim(),
  });

  return {
    headers: result.meta.fields ?? [],
    rows: result.data.map((row, index) => ({ ...row, __row: index + 2 })),
    parseErrors: result.errors.map((error) => ({
      row: (error.row ?? 0) + 2,
      message: error.message,
    })),
  };
}

export type CapacityImportRow = { club: string; capacity: string; row: number };

export function parseCapacityText(source: string): {
  rows: CapacityImportRow[];
  errors: string[];
} {
  const clean = source.replace(/^\uFEFF/u, '').replace(/\r\n?/gu, '\n');
  if (!clean.trim()) return { rows: [], errors: ['The capacity list is empty.'] };

  const firstLine = clean.split('\n', 1)[0] ?? '';
  const delimiter = firstLine.includes('\t') ? '\t' : ',';
  const result = Papa.parse<string[]>(clean, { delimiter, skipEmptyLines: 'greedy' });
  const rawRows = result.data;
  const hasHeader = rawRows[0]?.[0]?.trim().toLowerCase() === 'club' &&
    rawRows[0]?.[1]?.trim().toLowerCase() === 'capacity';
  const start = hasHeader ? 1 : 0;

  const rows = rawRows.slice(start).map((fields, index) => ({
    club: (fields[0] ?? '').trim(),
    capacity: (fields[1] ?? '').trim(),
    row: index + start + 1,
  }));
  const errors = result.errors.map((error) => `Row ${(error.row ?? 0) + 1}: ${error.message}`);
  for (const row of rows) {
    const sourceRow = rawRows[row.row - 1] ?? [];
    if (sourceRow.length !== 2) errors.push(`Row ${row.row}: expected exactly two columns.`);
  }
  return { rows, errors };
}
