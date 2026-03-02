function extractUrlsFromText(text) {
  const candidates = text.match(/https?:\/\/[^\s<>"'`]+/gi) || [];
  const seen = new Set();
  const urls = [];

  for (const candidate of candidates) {
    const cleaned = candidate.trim().replace(/[),.;!?]+$/g, '');
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
