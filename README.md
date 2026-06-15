# ChatGPT Conversation Export

ChatGPT Conversation Export is an unofficial Firefox extension that exports the currently open ChatGPT conversation.

The extension creates local JSON or HTML files without sending conversations to any third-party server.

## Features

- Export the readable conversation as JSON.
- Export the readable conversation as HTML.
- Export a complete archive as JSON.
- Export a complete archive as HTML.
- ChatGPT-like HTML rendering: headings, lists, tables, code blocks, quotes and source references.
- Integrated button inside the ChatGPT page.
- Settings for language, theme, button position and visible actions.

## Export modes

### Readable conversation

This mode is designed for human reading. It removes unnecessary internal elements and presents messages in a form closer to the original conversation.

The HTML output can render:

- code blocks with language labels;
- Markdown tables;
- nested lists;
- images and galleries when metadata is available;
- referenced attachments;
- web sources as clickable buttons with detail panels.

### Complete archive

This mode keeps more technical metadata for verification, diagnostics or future recovery of linked content.

## Privacy

The extension runs locally in the browser.

It uses the already active ChatGPT session in the open tab to retrieve the current conversation through ChatGPT APIs. The session token is used in memory only during the export. It is not stored and is not written to generated files.

The extension does not send conversations, files, metadata, settings or tokens to a third-party server.

See also: `PRIVACY.md`.

## Permissions

The extension only requests the permissions required for its purpose:

- `storage`: save local extension settings;
- `https://chatgpt.com/*`: access the open ChatGPT page and export the active conversation.

## Known limitations

ChatGPT may change its interface or internal APIs. In that case, the export feature may require an extension update.

Some images, sources or attachments may only be available as internal references or remote URLs. When a direct preview is not available, the extension keeps useful information instead of generating fake content.

Direct PDF export is not included yet. The exported HTML file can already be printed to PDF from the browser.

## Independence

ChatGPT Conversation Export is an unofficial extension. It is not developed, endorsed or affiliated with OpenAI.


## License

This project is licensed under the Mozilla Public License 2.0.

Copyright (c) 2026 John2022.
