# Tab2Notes

**Created:** 2026-02-23-13-46
**Last Updated:** 2026-09-16

Export all URLs from your Chrome browser directly to Apple Notes (macOS) or save as a text file.

## Install Tab2Notes

**[Add to Chrome](https://chromewebstore.google.com/detail/tab2notes/gbpnligkgocgadiknklabehjdjfnopph)** · **[Download the Apple Shortcut](https://github.com/sburl/Tab2Notes/raw/refs/heads/main/Tab2Notes.shortcut)**

### 1. Add the extension

1. Open [Tab2Notes in the Chrome Web Store](https://chromewebstore.google.com/detail/tab2notes/gbpnligkgocgadiknklabehjdjfnopph) using Chrome.
2. Click **Add to Chrome**, then **Add extension**.
3. Click Chrome's puzzle-piece icon and pin **Tab2Notes** so it's easy to find.

No GitHub account, code download, or Developer mode is needed.

### 2. On a Mac, connect Apple Notes

1. [Download Tab2Notes.shortcut](https://github.com/sburl/Tab2Notes/raw/refs/heads/main/Tab2Notes.shortcut).
2. Open the downloaded file from your Downloads folder.
3. Click **Add Shortcut** in Apple's Shortcuts app. Keep its name **Tab2Notes**.

Version 2.1.0 also links to this download at the bottom of its popup. If Shortcuts asks for access to Notes or the downloaded text file on first use, review and allow that access to complete the export.

**Windows or Linux?** Skip step 2. Your tabs are exported to a text file instead.

## Usage

1. Click the extension icon
2. Choose an action:
   - **Current window** - Export tabs from the current window
   - **All windows** - Export tabs from all open windows
   - **Bring tabs back** - Paste text, then click **Open Links** and confirm
3. Done!

**With Shortcut (macOS):** A new note appears in Apple Notes automatically
**On macOS:** Install the Shortcut first. The extension can launch Shortcuts, but cannot confirm that a note was created.

### Open URLs Flow

1. Paste any text containing links into the **Open URLs** box — links are extracted instantly
2. Click **Open N Links** to confirm and open all detected URLs
3. Tabs open in the current window

## Developer installation

For development only: download or clone this repository, open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the folder containing `manifest.json`.

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

## Notebook interface

Version 2.1.0 adds a textured notebook design, amber current-window export, blue all-window export, system light/dark themes, and matching toolbar icons. The footer links directly to the Apple Shortcut download. Export saves a copy and leaves tabs open.
