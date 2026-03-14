// Tab2Notes - export existing tabs and import URL lists for batched opening.

const BATCH_SIZE = 10;
let parsedUrls = [];
let inputParseTimer = null;
let isOpening = false;

function setStatus(statusEl, message, type) {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function renderImportSummary(urls, urlPreview) {
  urlPreview.textContent = '';

  if (!urls.length) {
    return;
  }

  urls.forEach((url) => {
    const item = document.createElement('div');
    item.className = 'url-item';
    item.textContent = url;
    urlPreview.appendChild(item);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function openUrlsInBatches(urls, windowId, statusEl) {
  let opened = 0;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((url) => {
        const createOptions = { url, active: false };
        if (windowId) {
          createOptions.windowId = windowId;
        }
        return chrome.tabs.create(createOptions);
      }),
    );

    opened += batch.length;
    setStatus(statusEl, `Opening links... ${opened}/${urls.length}`, 'info');

    if (opened < urls.length) {
      await sleep(300);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const exportCurrentBtn = document.getElementById('exportCurrentBtn');
  const exportAllBtn = document.getElementById('exportAllBtn');
  const currentCountEl = document.getElementById('currentCount');
  const allCountEl = document.getElementById('allCount');
  const statusEl = document.getElementById('status');
  const importInput = document.getElementById('importInput');
  const scanBtn = document.getElementById('scanBtn');
  const urlPreview = document.getElementById('urlPreview');

  let currentWindowTabs = [];
  currentCountEl.textContent = '... tabs';
  allCountEl.textContent = '... tabs';

  async function refreshTabCounts() {
    try {
      const [freshCurrentWindowTabs, allTabs] = await Promise.all([
        chrome.tabs.query({ currentWindow: true }),
        chrome.tabs.query({}),
      ]);

      currentWindowTabs = freshCurrentWindowTabs;
      currentCountEl.textContent = `${currentWindowTabs.length} tab${currentWindowTabs.length !== 1 ? 's' : ''}`;
      allCountEl.textContent = `${allTabs.length} tab${allTabs.length !== 1 ? 's' : ''}`;
    } catch (error) {
      console.error('Count refresh error:', error);
      currentCountEl.textContent = 'count unavailable';
      allCountEl.textContent = 'count unavailable';
    }
  }

  // Defer count queries so popup can paint first.
  setTimeout(() => {
    refreshTabCounts();
  }, 50);

  function updateParsedUrlsUI() {
    parsedUrls = extractUrlsFromText(importInput.value);
    renderImportSummary(parsedUrls, urlPreview);

    if (parsedUrls.length && !isOpening) {
      scanBtn.disabled = false;
      scanBtn.textContent = `Open ${parsedUrls.length} Link${parsedUrls.length === 1 ? '' : 's'}`;
    } else {
      scanBtn.disabled = true;
      scanBtn.textContent = 'Open Links';
      statusEl.textContent = '';
      statusEl.className = 'status';
    }
  }

  // Initialize disabled/open state before any user input.
  updateParsedUrlsUI();

  importInput.addEventListener('input', () => {
    if (inputParseTimer) {
      clearTimeout(inputParseTimer);
    }

    // Parse shortly after input so count appears effectively instantly.
    inputParseTimer = setTimeout(() => {
      updateParsedUrlsUI();
    }, 80);
  });

  scanBtn.addEventListener('click', async () => {
    scanBtn.disabled = true;

    try {
      setStatus(statusEl, 'Finding links...', 'info');

      if (!parsedUrls.length) {
        setStatus(statusEl, 'No links to open.', 'error');
        return;
      }

      const confirmed = window.confirm(
        `Open ${parsedUrls.length} link${parsedUrls.length === 1 ? '' : 's'} now?`,
      );
      if (!confirmed) {
        return;
      }

      exportCurrentBtn.disabled = true;
      exportAllBtn.disabled = true;
      isOpening = true;

      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const targetWindowId = activeTab?.windowId;
      const openedCount = parsedUrls.length;
      await openUrlsInBatches(parsedUrls, targetWindowId, statusEl);
      // Clear state so button goes back to disabled — can't re-open the same set
      importInput.value = '';
      urlPreview.textContent = '';
      parsedUrls = [];
      setStatus(statusEl, `Opened ${openedCount} link${openedCount === 1 ? '' : 's'}.`, 'success');
    } catch (error) {
      console.error('Scan/open links error:', error);
      setStatus(statusEl, `Error: ${error.message}`, 'error');
    } finally {
      isOpening = false;
      exportCurrentBtn.disabled = false;
      exportAllBtn.disabled = false;
      updateParsedUrlsUI();
    }
  });

  exportCurrentBtn.addEventListener('click', async () => {
    currentWindowTabs = await chrome.tabs.query({ currentWindow: true });
    currentCountEl.textContent = `${currentWindowTabs.length} tab${currentWindowTabs.length !== 1 ? 's' : ''}`;
    await performExport(currentWindowTabs, false);
    refreshTabCounts();
  });

  exportAllBtn.addEventListener('click', async () => {
    const allTabs = await chrome.tabs.query({});
    allCountEl.textContent = `${allTabs.length} tab${allTabs.length !== 1 ? 's' : ''}`;
    await performExport(allTabs, true);
    refreshTabCounts();
  });

  async function performExport(tabs, isAllWindows) {
    exportCurrentBtn.disabled = true;
    exportAllBtn.disabled = true;
    scanBtn.disabled = true;
    setStatus(statusEl, 'Exporting...', 'info');

    try {
      const result = await ExportCore.exportWithFallback(tabs, {
        groupByWindow: isAllWindows,
        title: isAllWindows ? 'Chrome Window Export - All Windows' : 'Chrome Window Export',
        shortcutName: 'Tab2Notes',
      });

      setStatus(statusEl, result.message, 'success');
    } catch (error) {
      console.error('Export error:', error);
      setStatus(statusEl, `Error: ${error.message}`, 'error');
    } finally {
      exportCurrentBtn.disabled = false;
      exportAllBtn.disabled = false;
      updateParsedUrlsUI();
    }
  }
});
