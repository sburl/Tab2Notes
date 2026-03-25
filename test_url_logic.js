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
    {
      name: 'Extracts bare domain with path',
      input: 'x.com/remilouf/status/2016047512478507444',
      expected: ['https://x.com/remilouf/status/2016047512478507444'],
    },
    {
      name: 'Extracts multiple bare domains',
      input: 'x.com/fin465/status/123 and jaredheyman.medium.com/on-rebel-theorem-4-0',
      expected: [
        'https://x.com/fin465/status/123',
        'https://jaredheyman.medium.com/on-rebel-theorem-4-0',
      ],
    },
    {
      name: 'Extracts bare subdomain URLs',
      input: 'hks.harvard.edu/publications/investing-unknown',
      expected: ['https://hks.harvard.edu/publications/investing-unknown'],
    },
    {
      name: 'Mixes bare and protocol URLs',
      input: 'Check https://example.com and also x.com/user/status/123',
      expected: ['https://example.com/', 'https://x.com/user/status/123'],
    },
    {
      name: 'Strips trailing punctuation from bare URLs',
      input: 'See bykahlil.com/writing/design-your-life, and brattle.com/the-untapped-grid/.',
      expected: [
        'https://bykahlil.com/writing/design-your-life',
        'https://brattle.com/the-untapped-grid/',
      ],
    },
    {
      name: 'Ignores bare domain without path (avoids false positives)',
      input: 'visit example.com sometime',
      expected: [],
    },
    {
      name: 'Does not extract bare domain from ftp:// URLs',
      input: 'ftp://example.com/file.txt',
      expected: [],
    },
    {
      name: 'Does not extract bare domain from mailto: addresses',
      input: 'mailto:user@example.com/path',
      expected: [],
    },
    {
      name: 'Does not match partial domain from underscored hostnames',
      input: 'sub_domain.example.com/path',
      expected: [],
    },
    {
      name: 'Deduplicates bare and protocol versions',
      input: 'https://x.com/user/post and x.com/user/post',
      expected: ['https://x.com/user/post'],
    },
    {
      name: 'Handles real-world pasted list of bare URLs',
      input:
        'URL: x.com/remilouf/status/2016047512478507444\n' +
        'URL: hks.harvard.edu/publications/investing-unknown\n' +
        'URL: linkedin.com/pulse/something\n' +
        'URL: dilbagi.notion.site/fabric-architecture-memo',
      expected: [
        'https://x.com/remilouf/status/2016047512478507444',
        'https://hks.harvard.edu/publications/investing-unknown',
        'https://linkedin.com/pulse/something',
        'https://dilbagi.notion.site/fabric-architecture-memo',
      ],
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
