/**
 * exportCore.js
 * Shared Chrome tab export functionality for Tab2Notes and CurrentTab2Script
 *
 * This module provides reusable export logic that can be used by multiple extensions.
 */

const ExportCore = {
  /**
   * Wait for a Chrome download to complete
   * @param {number} downloadId - Chrome download ID
   * @returns {Promise<void>}
   */
  waitForDownload(downloadId) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Download timeout')), 5000);

      chrome.downloads.onChanged.addListener(function onChanged(delta) {
        if (delta.id === downloadId && delta.state) {
          if (delta.state.current === 'complete') {
            clearTimeout(timeout);
            chrome.downloads.onChanged.removeListener(onChanged);
            resolve();
          } else if (delta.state.current === 'interrupted') {
            clearTimeout(timeout);
            chrome.downloads.onChanged.removeListener(onChanged);
            reject(new Error('Download interrupted'));
          }
        }
      });
    });
  },

  /**
   * Format date for display
   * @returns {string} Formatted date string
   */
  formatDate() {
    const now = new Date();
    return now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  /**
   * Format tabs as text content
   * @param {Array} tabs - Array of Chrome tab objects
   * @param {Object} options - Formatting options
   * @param {boolean} options.groupByWindow - Group tabs by window
   * @param {string} options.title - Title for the export
   * @returns {string} Formatted text content
   */
  formatTabsAsText(tabs, options = {}) {
    const {
      groupByWindow = false,
      title = 'Chrome Window Export'
    } = options;

    const dateStr = this.formatDate();
    let content = `${title}\n${dateStr}\n${'─'.repeat(40)}\n\n`;

    if (groupByWindow) {
      // Group tabs by window
      const tabsByWindow = {};
      tabs.forEach(tab => {
        if (!tabsByWindow[tab.windowId]) {
          tabsByWindow[tab.windowId] = [];
        }
        tabsByWindow[tab.windowId].push(tab);
      });

      // Format each window
      const windowIds = Object.keys(tabsByWindow).sort();
      windowIds.forEach((windowId, windowIndex) => {
        const windowTabs = tabsByWindow[windowId];
        content += `Window ${windowIndex + 1} (${windowTabs.length} tab${windowTabs.length !== 1 ? 's' : ''})\n`;
        windowTabs.forEach((tab, index) => {
          const tabTitle = tab.title || 'Untitled';
          const url = tab.url || '';
          content += `${index + 1}. ${tabTitle}\n   ${url}\n\n`;
        });
        if (windowIndex < windowIds.length - 1) {
          content += '\n';
        }
      });

      content += `${'─'.repeat(40)}\nTotal: ${tabs.length} tab${tabs.length !== 1 ? 's' : ''} across ${windowIds.length} window${windowIds.length !== 1 ? 's' : ''}`;
    } else {
      // Single list format
      tabs.forEach((tab, index) => {
        const tabTitle = tab.title || 'Untitled';
        const url = tab.url || '';
        content += `${index + 1}. ${tabTitle}\n   ${url}\n\n`;
      });

      content += `${'─'.repeat(40)}\nTotal: ${tabs.length} tab${tabs.length !== 1 ? 's' : ''}`;
    }

    return content;
  },

  /**
   * Format single tab as JSON for script processing
   * @param {Object} tab - Chrome tab object
   * @returns {string} JSON string
   */
  formatTabAsJSON(tab) {
    const exportData = {
      timestamp: new Date().toISOString(),
      title: tab.title || 'Untitled',
      url: tab.url || '',
      tab_id: tab.id
    };
    return JSON.stringify(exportData, null, 2);
  },

  /**
   * Download content as a file
   * @param {string} content - Content to download
   * @param {Object} options - Download options
   * @param {string} options.filename - Filename for download
   * @param {string} options.mimeType - MIME type (default: text/plain)
   * @param {boolean} options.saveAs - Show save dialog (default: false)
   * @param {boolean} options.waitForComplete - Wait for download to complete (default: true)
   * @returns {Promise<number>} Download ID
   */
  async downloadFile(content, options = {}) {
    const {
      filename = 'export.txt',
      mimeType = 'text/plain',
      saveAs = false,
      waitForComplete = true
    } = options;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    try {
      const downloadId = await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: saveAs,
        conflictAction: 'overwrite'
      });

      if (waitForComplete) {
        await this.waitForDownload(downloadId);
      }

      return downloadId;
    } finally {
      // Clean up after a delay if not waiting
      if (!waitForComplete) {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        URL.revokeObjectURL(url);
      }
    }
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Clipboard error:', error);
      return false;
    }
  },

  /**
   * Trigger Apple Shortcuts integration
   * @param {string} shortcutName - Name of the shortcut
   */
  triggerShortcut(shortcutName) {
    window.open(`shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`);
  },

  /**
   * Export tabs to Apple Notes via Shortcuts
   * @param {Array} tabs - Array of Chrome tab objects
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Result object with success status and message
   */
  async exportToNotes(tabs, options = {}) {
    const {
      groupByWindow = false,
      title = 'Chrome Window Export',
      shortcutName = 'Tab2Notes'
    } = options;

    try {
      // Format content
      const content = this.formatTabsAsText(tabs, { groupByWindow, title });

      // Save temp file
      await this.downloadFile(content, {
        filename: 'chrome-export-temp.txt',
        saveAs: false,
        waitForComplete: true
      });

      // Trigger Shortcut
      this.triggerShortcut(shortcutName);

      return {
        success: true,
        message: '✓ Exported to Apple Notes!'
      };
    } catch (error) {
      throw new Error(`Notes export failed: ${error.message}`);
    }
  },

  /**
   * Export tabs to a downloadable text file
   * @param {Array} tabs - Array of Chrome tab objects
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Result object with success status and message
   */
  async exportToFile(tabs, options = {}) {
    const {
      groupByWindow = false,
      title = 'Chrome Window Export'
    } = options;

    try {
      // Format content
      const content = this.formatTabsAsText(tabs, { groupByWindow, title });

      // Generate filename
      const now = new Date();
      const filename = `chrome-urls-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}.txt`;

      // Download with save dialog
      await this.downloadFile(content, {
        filename: filename,
        saveAs: true,
        waitForComplete: false
      });

      return {
        success: true,
        message: '✓ Exported to .txt file!'
      };
    } catch (error) {
      throw new Error(`File export failed: ${error.message}`);
    }
  },

  /**
   * Export single tab to JSON file for script processing
   * @param {Object} tab - Chrome tab object
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Result object with success status and message
   */
  async exportTabToJSON(tab, options = {}) {
    const {
      filename = 'current-tab-export.json',
      copyToClipboard = true
    } = options;

    try {
      // Format as JSON
      const content = this.formatTabAsJSON(tab);

      // Download JSON file
      await this.downloadFile(content, {
        filename: filename,
        mimeType: 'application/json',
        saveAs: false,
        waitForComplete: true
      });

      // Copy URL to clipboard
      let clipboardSuccess = false;
      if (copyToClipboard) {
        clipboardSuccess = await this.copyToClipboard(tab.url);
      }

      return {
        success: true,
        message: clipboardSuccess
          ? '✓ Exported! URL also copied to clipboard.'
          : '✓ URL exported to Downloads folder!'
      };
    } catch (error) {
      throw new Error(`JSON export failed: ${error.message}`);
    }
  },

  /**
   * Universal export with automatic fallback
   * Tries Shortcuts first, then file download, then clipboard
   * @param {Array} tabs - Array of Chrome tab objects
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Result object with success status and message
   */
  async exportWithFallback(tabs, options = {}) {
    // Try Shortcuts first
    try {
      return await this.exportToNotes(tabs, options);
    } catch (shortcutError) {
      console.log('Shortcuts failed, trying file download:', shortcutError);

      // Try file download
      try {
        return await this.exportToFile(tabs, options);
      } catch (fileError) {
        console.log('File download failed, using clipboard:', fileError);

        // Fallback to clipboard
        const content = this.formatTabsAsText(tabs, options);
        const success = await this.copyToClipboard(content);

        if (success) {
          return {
            success: true,
            message: '📋 Copied to clipboard! Paste into Notes.'
          };
        } else {
          throw new Error('All export methods failed');
        }
      }
    }
  }
};

// Make available globally for use in popup scripts
window.ExportCore = ExportCore;
