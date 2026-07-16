import assert from 'node:assert/strict';

for (
  const filename of [
    'clubstonbury-admin-guide.pdf',
    'clubstonbury-algorithm-guide.pdf',
  ]
) {
  Deno.test(`${filename} is a committed PDF asset`, async () => {
    const contents = await Deno.readFile(`static/guides/${filename}`);
    assert.ok(contents.length > 50_000, 'Expected a non-trivial illustrated guide.');
    assert.equal(new TextDecoder().decode(contents.slice(0, 5)), '%PDF-');
  });
}
