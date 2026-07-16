export function safeSpreadsheetString(value: string): string {
  return /^[=+\-@]/u.test(value) ? `'${value}` : value;
}
