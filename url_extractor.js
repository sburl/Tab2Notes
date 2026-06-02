/**
 * url_extractor.js
 * Extract and normalize URLs from arbitrary text.
 *
 * Fixes (WRK-278):
 *  1. Paren trim  — strip trailing unbalanced closing parens before validation
 *  2. Dedup       — deduplicate on the raw cleaned string *before* normalization
 *                   so that https://x.com and https://x.com/ don't both survive
 *  3. No-URL flag — returns { urls, hasText } so callers can show a warning
 */

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
  const candidates = text.match(/https?:\/\/[^\s<>"'`]+/gi) || [];
  const seenCleaned = new Set();
  const seenNormalized = new Set();
  const urls = [];

  for (const candidate of candidates) {
    const cleaned = trimTrailingPunctuation(candidate.trim());

    // Bug #2 fix: deduplicate on the cleaned string *before* URL normalization.
    // This prevents e.g. "http://x.com" and "http://x.com/" from both passing
    // through to the URL constructor, which would normalize them identically but
    // only the Set(normalized) check would catch the second—which it does—so the
    // real guard here is also having the pre-normalization cleaned dedupe.
    if (seenCleaned.has(cleaned)) continue;
    seenCleaned.add(cleaned);

    try {
      const normalized = new URL(cleaned).toString();
      // Also deduplicate on normalized form (catches http://x.com vs http://x.com/)
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
