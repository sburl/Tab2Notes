function extractUrlsFromText(text) {
  const URL_RE = /https?:\/\/[^\s<>"'`]+|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}\/[^\s<>"'`]*/gi;
  const candidates = text.match(URL_RE) || [];
  const seen = new Set();
  const urls = [];

  for (const candidate of candidates) {
    let cleaned = candidate.trim().replace(/[),.;!?]+$/g, '');
    if (!/^https?:\/\//i.test(cleaned)) {
      cleaned = 'https://' + cleaned;
    }
    try {
      const normalized = new URL(cleaned).toString();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        urls.push(normalized);
      }
    } catch {
      // Ignore malformed URLs found in pasted text.
    }
  }

  return urls;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { extractUrlsFromText };
} else {
  window.extractUrlsFromText = extractUrlsFromText;
}
