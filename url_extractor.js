/**
 * url_extractor.js
 * Extract and normalize URLs from arbitrary text.
 *
 * Fixes (WRK-278):
 *  1. Paren trim  — strip trailing unbalanced closing parens before validation
 *  2. Dedup       — deduplicate on the cleaned string before normalization AND
 *                   on the normalized form, so https://x.com and https://x.com/
 *                   don't both survive
 *  3. No-URL case — returns [] so callers can warn when pasted text has no links
 *
 * Also supports bare domains without a protocol (e.g. example.com/path),
 * auto-prefixed with https:// before validation.
 */

const PROTOCOL_RE = 'https?://[^\\s<>"\'`]+';
const BARE_DOMAIN_RE = '(?<!\\S)(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,}/[^\\s<>"\'`]*';
const URL_RE = new RegExp(`${PROTOCOL_RE}|${BARE_DOMAIN_RE}`, 'gi');

/**
 * Strip trailing punctuation and unbalanced closing parens from a URL candidate.
 * Balanced parens inside a URL (e.g. Wikipedia links) are preserved.
 *
 * @param {string} candidate
 * @returns {string}
 */
function trimTrailingPunctuation(candidate) {
  // First strip obvious trailing punctuation that can't appear in a URL path.
  let s = candidate.replace(/[,.;!?]+$/g, '');

  // Now strip unbalanced closing parens from the tail.
  // Count opens vs closes; remove one trailing ')' at a time while unbalanced.
  let opens = 0;
  for (const ch of s) {
    if (ch === '(') opens++;
    else if (ch === ')') opens--;
  }
  // opens < 0 means more ')' than '(' — strip them from the end
  while (opens < 0 && s.endsWith(')')) {
    s = s.slice(0, -1);
    opens++;
  }

  return s;
}

/**
 * Extract all unique, valid URLs from a block of text.
 *
 * @param {string} text
 * @returns {string[]} Normalized URL strings
 */
function extractUrlsFromText(text) {
  const candidates = text.match(URL_RE) || [];
  const seenCleaned = new Set();
  const seenNormalized = new Set();
  const urls = [];

  for (const candidate of candidates) {
    let cleaned = trimTrailingPunctuation(candidate.trim());
    if (!/^https?:\/\//i.test(cleaned)) {
      cleaned = 'https://' + cleaned;
    }

    // Bug #2 fix: deduplicate on the cleaned string *before* URL normalization,
    // then again on the normalized form (catches http://x.com vs http://x.com/).
    if (seenCleaned.has(cleaned)) continue;
    seenCleaned.add(cleaned);

    try {
      const normalized = new URL(cleaned).toString();
      if (!seenNormalized.has(normalized)) {
        seenNormalized.add(normalized);
        urls.push(normalized);
      }
    } catch {
      // Ignore malformed URL candidates.
    }
  }

  return urls;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { extractUrlsFromText, trimTrailingPunctuation };
} else {
  window.extractUrlsFromText = extractUrlsFromText;
  window.trimTrailingPunctuation = trimTrailingPunctuation;
}
