import { compareText } from '../csv/normalise.ts';

export async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function deterministicOrder(
  childIds: string[],
  prefix: string,
): Promise<string[]> {
  const priorities = await Promise.all(
    childIds.map(async (childId) => ({
      childId,
      digest: await sha256(`${prefix}:child:${childId}`),
    })),
  );
  return priorities.sort((a, b) =>
    compareText(a.digest, b.digest) || compareText(a.childId, b.childId)
  )
    .map(({ childId }) => childId);
}

export function createRandomSeed(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
