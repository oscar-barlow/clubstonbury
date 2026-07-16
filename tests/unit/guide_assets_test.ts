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

Deno.test('administrator guide keeps timing optional and explains spreadsheet IDs', async () => {
  const source = await Deno.readTextFile('guides/admin-guide.html');

  assert.match(source, /two weeks is a useful example, not a requirement/iu);
  assert.match(source, /Excel/iu);
  assert.match(source, /Google Sheets/iu);
  assert.match(source, /RANDBETWEEN\(0,2147483647\)/u);
  assert.match(source, /https:\/\/clubstonbury\.onrender\.com\/demo/u);
  assert.match(source, /Upload and validate applications/iu);
  assert.match(source, /Set club capacities/iu);
  assert.match(source, /Review settings and run/iu);
  assert.match(source, /Review results/iu);
  assert.match(source, /Download and clear/iu);
  assert.doesNotMatch(source, /Do not reorder/iu);
  assert.doesNotMatch(source, /Keep the seed/iu);
  assert.doesNotMatch(source, /Seed recorded/iu);
});

Deno.test('algorithm guide explains randomised preference-order allocation in plain language', async () => {
  const source = await Deno.readTextFile('guides/algorithm-guide.html');

  assert.match(source, /randomised order/iu);
  assert.match(source, /preference order/iu);
  assert.doesNotMatch(source, /SHA-256/iu);
  assert.doesNotMatch(source, /Fairness without Stress/iu);
});
