[English](README.md) | [Français](README.fr.md)

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

## Downloads

The latest release candidate is available from the GitHub Releases page:

[Download the latest release](https://github.com/John2022/chatgpt-conversation-export/releases)

Current release candidate: `v1.0.0-rc5`

## Why this extension exists

ChatGPT Conversation Export was created for users who work with long, complex conversations and need a reliable way to preserve or continue them.

Long ChatGPT conversations can eventually become difficult to use: the page may become slow, responses may take much longer, the model may start repeating itself, lose track of earlier decisions, or make more mistakes because the conversation has become too large and overloaded.

The extension helps by exporting the current conversation to readable local files, so the user can:

* keep an offline backup of important conversations;
* preserve the work already done;
* review long conversations outside the ChatGPT interface;
* extract useful context before starting a new conversation;
* continue a project from a cleaner, shorter prompt;
* reduce the risk of losing important details when a conversation becomes too long to continue comfortably.

The goal is not only to archive conversations, but also to make long-running work easier to resume, transfer and document.

## Screenshots

### Firefox extension panel

![Firefox extension panel](screenshots/01-extension-toolbar-menu-1.png)

### Extension popup menu

![Extension popup menu](screenshots/02-extension-toolbar-menu-2.png)

### Integrated ChatGPT button

![Integrated ChatGPT button](screenshots/03-integrated-button.png)

### Options page

![Options page](screenshots/04-options-page.png)

### Integrated export confirmation

![Integrated export confirmation](screenshots/05-integrated-export-complete.png)

### Demo conversation in ChatGPT

![Demo conversation in ChatGPT](screenshots/06-chatgpt-demo-conversation.png)

### Readable HTML conversation layout

![Readable HTML conversation layout](screenshots/07-readable-html-conversation-layout.png)

### Full-width readable HTML export

![Full-width readable HTML export](screenshots/08-readable-html-full-width.png)

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
