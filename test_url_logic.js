const assert = require('assert');
const { extractUrlsFromText, trimTrailingPunctuation } = require('./url_extractor.js');

function runTests() {
  console.log('Running tests for extractUrlsFromText...\n');

  const testCases = [
    // ── Existing baseline tests ──────────────────────────────────────────────
    {
      name: 'Extracts single valid URL',
      input: 'Check out this website: https://example.com',
      expected: ['https://example.com/'],
    },
    {
      name: 'Extracts multiple URLs',
      input: 'First: http://test.com, then: https://example.org/path',
      expected: ['http://test.com/', 'https://example.org/path'],
    },
    {
      name: 'Removes trailing punctuation',
      input: 'Go to https://example.com. Or https://example.org!',
      expected: ['https://example.com/', 'https://example.org/'],
    },
    {
      name: 'Ignores duplicates',
      input: 'Link one https://example.com and again https://example.com',
      expected: ['https://example.com/'],
    },
    {
      name: 'Handles no URLs',
      input: 'Just some text without any links.',
      expected: [],
    },

    // ── Bug #1: Paren trim ───────────────────────────────────────────────────
    {
      name: 'Bug #1a: strips unbalanced trailing paren (markdown-style)',
      // "(https://example.com)" — the outer parens are the prose punctuation
      input: 'See (https://example.com)',
      expected: ['https://example.com/'],
    },
    {
      name: 'Bug #1b: preserves balanced parens inside URL (Wikipedia)',
      // Wikipedia URLs like /wiki/Foo_(disambiguation) must survive
      input: 'See https://en.wikipedia.org/wiki/Foo_(disambiguation)',
      expected: ['https://en.wikipedia.org/wiki/Foo_(disambiguation)'],
    },
    {
      name: 'Bug #1c: strips only the unbalanced closing paren',
      // URL has one pair of balanced parens + one extra closing paren from prose
      input: 'Go to (https://en.wikipedia.org/wiki/Foo_(bar)) now',
      expected: ['https://en.wikipedia.org/wiki/Foo_(bar)'],
    },

    // ── Bug #2: Dedup ────────────────────────────────────────────────────────
    {
      name: 'Bug #2a: dedup — trailing-slash variants count as one URL',
      input: 'https://example.com and https://example.com/',
      expected: ['https://example.com/'],
    },
    {
      name: 'Bug #2b: dedup — identical cleaned string not emitted twice',
      input: 'https://example.com/path https://example.com/path',
      expected: ['https://example.com/path'],
    },

    // ── Bug #3: No-URL warning (behaviour via empty return) ──────────────────
    {
      name: 'Bug #3: empty array returned for text with no URLs',
      input: 'This is plain text with no links at all.',
      expected: [],
    },
    {
      name: 'Bug #3: empty array returned for empty string',
      input: '',
      expected: [],
    },
  ];

  let passed = 0;
  for (const test of testCases) {
    try {
      const result = extractUrlsFromText(test.input);
      assert.deepStrictEqual(result, test.expected);
      console.log(`  ✓ ${test.name}`);
      passed++;
    } catch {
      console.error(`  ✗ ${test.name}`);
      console.error(`    Expected: ${JSON.stringify(test.expected)}`);
      console.error(`    Got:      ${JSON.stringify(extractUrlsFromText(test.input))}`);
    }
  }

  // ── trimTrailingPunctuation unit tests ────────────────────────────────────
  console.log('\nRunning tests for trimTrailingPunctuation...\n');
  const trimCases = [
    { input: 'https://example.com)', expected: 'https://example.com' },
    { input: 'https://example.com/foo_(bar)', expected: 'https://example.com/foo_(bar)' },
    { input: 'https://example.com/foo_(bar))', expected: 'https://example.com/foo_(bar)' },
    { input: 'https://example.com,', expected: 'https://example.com' },
    { input: 'https://example.com.', expected: 'https://example.com' },
    { input: 'https://example.com!', expected: 'https://example.com' },
  ];
  for (const tc of trimCases) {
    try {
      const result = trimTrailingPunctuation(tc.input);
      assert.strictEqual(result, tc.expected);
      console.log(`  ✓ trim: "${tc.input}" -> "${tc.expected}"`);
      passed++;
    } catch {
      console.error(`  ✗ trim: "${tc.input}"`);
      console.error(`    Expected: "${tc.expected}"`);
      console.error(`    Got:      "${trimTrailingPunctuation(tc.input)}"`);
    }
  }

  const total = testCases.length + trimCases.length;
  console.log(`\n${passed}/${total} tests passed.`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
