export function displayClubName(value: string): string {
  return value.trim().replace(/\s+/gu, ' ');
}

export function clubComparisonKey(value: string): string {
  return displayClubName(value).normalize('NFKC').toLocaleLowerCase('en-GB');
}

export function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
