// Tab2Notes - Refactored to use shared ExportCore module
// Now much simpler with all export logic in shared/exportCore.js

document.addEventListener('DOMContentLoaded', async () => {
  const exportCurrentBtn = document.getElementById('exportCurrentBtn');
  const exportAllBtn = document.getElementById('exportAllBtn');
  const currentCountEl = document.getElementById('currentCount');
  const allCountEl = document.getElementById('allCount');
  const statusEl = document.getElementById('status');

  // Get all tabs to show counts
  const allTabs = await chrome.tabs.query({});
  const currentWindowTabs = await chrome.tabs.query({ currentWindow: true });

  // Update button labels with counts
  currentCountEl.textContent = `${currentWindowTabs.length} tab${currentWindowTabs.length !== 1 ? 's' : ''}`;
  allCountEl.textContent = `${allTabs.length} tab${allTabs.length !== 1 ? 's' : ''}`;

  // Export current window
  exportCurrentBtn.addEventListener('click', async () => {
    await performExport(currentWindowTabs, false);
  });

  // Export all windows
  exportAllBtn.addEventListener('click', async () => {
    await performExport(allTabs, true);
  });

  async function performExport(tabs, isAllWindows) {
    exportCurrentBtn.disabled = true;
    exportAllBtn.disabled = true;
    statusEl.textContent = 'Exporting...';
    statusEl.className = 'status info';

    try {
      // Use shared ExportCore module for all export logic
      const result = await ExportCore.exportWithFallback(tabs, {
        groupByWindow: isAllWindows,
        title: isAllWindows ? 'Chrome Window Export - All Windows' : 'Chrome Window Export',
        shortcutName: 'Tab2Notes'
      });

      statusEl.textContent = result.message;
      statusEl.className = 'status success';
    } catch (error) {
      console.error('Export error:', error);
      statusEl.textContent = `Error: ${error.message}`;
      statusEl.className = 'status error';
    } finally {
      exportCurrentBtn.disabled = false;
      exportAllBtn.disabled = false;
    }
  }
});
