# Changelog

## 1.0.0-rc3 — Image carousel rendering fix

- Added rendering support for ChatGPT image carousel tokens (`i`) in readable HTML exports.
- Preserves image galleries from `image_v2` metadata when available.
- Added public screenshots to the README files.
- Added README language links and direct release download links.
- Updated AMO submission texts for the release candidate.


## 1.0.0-rc2 — Initial public release candidate

Initial public version of ChatGPT Conversation Export.

### Added

- Export the currently open ChatGPT conversation.
- Readable conversation export in JSON.
- Readable conversation export in HTML.
- Complete archive export in JSON.
- Complete archive export in HTML.
- Integrated button in the ChatGPT interface.
- Popup menu with multiple interface modes.
- Settings page.
- Language settings: automatic, French, English.
- HTML theme settings: automatic, light, dark.
- Integrated button theme settings.
- Configurable button position.
- Markdown rendering in HTML exports:
  - headings;
  - lists;
  - tables;
  - code blocks;
  - inline code;
  - bold and italic text;
  - blockquotes.
- Rendering of web source references with hover previews and click panels when metadata is available.
- Rendering of image galleries when image metadata is available.
- Compact gallery summaries generated from image metadata.
- Local export generation without a third-party server.

### Notes

Direct PDF export is not included in this version. Exported HTML files can be printed to PDF from the browser.

Some images, files or sources may only be available as references depending on the data returned by ChatGPT.
