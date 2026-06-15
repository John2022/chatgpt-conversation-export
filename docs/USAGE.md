# Usage guide

ChatGPT Conversation Export is a Firefox extension that exports the current ChatGPT conversation from the active browser tab.

The extension works from ChatGPT pages and produces local export files. It does not send exported conversations to a remote server.

## Opening the extension

The extension can be used in two ways:

1. from the Firefox toolbar button;
2. from the integrated button displayed inside the ChatGPT page, if enabled in the options.

## Available export formats

The extension provides the following export formats:

* readable HTML;
* complete HTML archive;
* readable JSON;
* complete JSON archive.

## Readable HTML export

Readable HTML is intended for normal reading and long-term consultation.

It keeps the conversation structure and renders common formatting such as:

* headings;
* lists;
* tables;
* inline code;
* code blocks;
* citations and source references where available;
* image galleries where available.

## Complete HTML archive

Complete HTML archive keeps more technical information than the readable HTML export.

It is useful for review, diagnostics, preservation and comparison.

## Readable JSON export

Readable JSON contains the extracted conversation data in a structured format.

It is useful for inspection, backup and interoperability.

## Complete JSON archive

Complete JSON archive includes the most complete structured export available from the extension.

It is mainly intended for diagnostics, advanced backup and technical review.

## Options

The options page allows configuration of:

* interface language;
* export mode;
* default export format;
* integrated ChatGPT button;
* integrated button position;
* menu mode;
* visible actions.

## Privacy

Exports are generated locally by the extension.

The extension does not operate an external service and does not upload conversations to a third-party server.

Users should still review exported files before sharing them, because exported conversations may contain personal information, private content or sensitive data.
