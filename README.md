# Tab2Notes

**Created:** 2026-02-23-13-46
**Last Updated:** 2026-02-23-15-44

Export all URLs from your Chrome browser directly to Apple Notes (macOS) or save as a text file.

## Installation

### 1. Install the Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select this folder
5. Pin to toolbar (optional): Click puzzle icon → Pin "Tab2Notes"

### 2. Enable Apple Notes Integration (macOS only)

**Double-click** `Tab2Notes.shortcut` → Click **"Add Shortcut"** → Done!

### 3. Enable Native Messaging for Notes (Advanced/Optional)

For direct background integration with Apple Notes, you can enable the Native Messaging host:

1. Copy the `shared/notes_host.py` script to a secure location (e.g., `/usr/local/bin/notes_host.py`)
2. Make it executable: `chmod +x /usr/local/bin/notes_host.py`
3. Edit `shared/com.tab2notes.apple_notes.json`:
   - Replace `[EXTENSION_ID_HERE]` with your actual extension ID from `chrome://extensions`
   - Update `path` if you placed `notes_host.py` somewhere else.
4. Copy the JSON file to Chrome's native messaging directory:
   - `mkdir -p ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/`
   - `cp shared/com.tab2notes.apple_notes.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/`

> **Windows/Linux users:** Skip steps 2 and 3. The extension will download files instead.

## Usage

1. Click the extension icon
2. Choose an action:
   - **Export Current Window** - Export tabs from the current window
   - **Export All Windows** - Export tabs from all open windows
   - **Open URLs** - Paste text, scan links, and confirm opening
3. Done!

**With Shortcut (macOS):** A new note appears in Apple Notes automatically
**Without Shortcut:** Chrome shows a save dialog for a .txt file

### Open URLs Flow

1. Paste any text containing links into the **Open URLs** box — links are extracted instantly
2. Click **Open N Links** to confirm and open all detected URLs
3. Tabs open in the current window

## For Developers

The export functionality is built with a modular architecture using `shared/exportCore.js`. This module can be reused in other Chrome extensions or projects.

### Using the Export Module

Include the module in your extension's HTML:

```html
<script src="shared/exportCore.js"></script>
<script src="your-code.js"></script>
```

### Available Functions

```javascript
// Export tabs with automatic fallback (Notes → File → Clipboard)
const result = await ExportCore.exportWithFallback(tabs, {
  groupByWindow: true,
  title: 'My Tab Export',
  shortcutName: 'Tab2Notes',
});

// Export to Apple Notes (macOS only)
const result = await ExportCore.exportToNotes(tabs, {
  title: 'My Tabs',
  shortcutName: 'YourShortcutName',
});

// Export as downloadable file
const result = await ExportCore.exportToFile(tabs, {
  filename: 'tabs.txt',
  groupByWindow: false,
});

// Export single tab as JSON
const result = await ExportCore.exportTabToJSON(tab, {
  filename: 'tab.json',
  copyToClipboard: true,
});

// Format tabs as text
const text = ExportCore.formatTabsAsText(tabs, { groupByWindow: true });

// Copy to clipboard
await ExportCore.copyToClipboard(text);
```

The module handles all the complexity of Chrome's download API, clipboard access, and Shortcuts integration. Use it in your own extensions to add export functionality without reinventing the wheel.

## Troubleshooting

**Shortcut doesn't work?**

- Check Shortcuts app for "Tab2Notes" shortcut
- Make sure you approved the shortcut installation

**Extension not loading?**

- Reload the extension at `chrome://extensions`
- Check that all files are present in the extension folder

## License

MIT — Free to use and modify.
