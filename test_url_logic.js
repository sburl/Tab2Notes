const assert = require('assert');
const { extractUrlsFromText } = require('./url_extractor.js');

function runTests() {
  console.log('Running tests for extractUrlsFromText...');

  const testCases = [
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
  ];

  let passed = 0;
  for (const test of testCases) {
    try {
      const result = extractUrlsFromText(test.input);
      assert.deepStrictEqual(result, test.expected);
      console.log(`✓ ${test.name}`);
      passed++;
    } catch {
      console.error(`✗ ${test.name}`);
      console.error(`  Expected: ${JSON.stringify(test.expected)}`);
      console.error(`  Got:      ${JSON.stringify(extractUrlsFromText(test.input))}`);
    }
  }

  console.log(`\n${passed}/${testCases.length} tests passed.`);
  if (passed !== testCases.length) {
    process.exit(1);
  }
}

runTests();
