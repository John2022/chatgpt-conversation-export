# Export formats

ChatGPT Conversation Export provides several export formats for different use cases.

## Summary

| Format                | Purpose                                              | Recommended use                                |
| --------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| Readable HTML         | Human-readable conversation export                   | Reading, archiving, printing                   |
| Complete HTML archive | Human-readable export with additional technical data | Review, diagnostics, preservation              |
| Readable JSON         | Structured conversation export                       | Backup, inspection, interoperability           |
| Complete JSON archive | Most complete structured export                      | Diagnostics, technical review, advanced backup |

## Readable HTML

Readable HTML is designed to be opened directly in a browser.

It focuses on readability and attempts to preserve the visible structure of the conversation:

* user and assistant messages;
* headings;
* paragraphs;
* lists;
* tables;
* inline code;
* code blocks;
* citations and source references when available;
* file citations when available;
* image galleries when available.

This format is the best choice for normal reading.

## Complete HTML archive

Complete HTML archive keeps additional information that may not be useful for ordinary reading but can be useful for review or diagnostics.

It may include more metadata than the readable HTML export.

This format is useful when an export needs to be preserved with as much context as possible while remaining readable in a browser.

## Readable JSON

Readable JSON exports the conversation in a structured form.

It is useful when the conversation needs to be inspected, compared, processed or preserved in a machine-readable format.

This format is not intended to visually reproduce the ChatGPT interface.

## Complete JSON archive

Complete JSON archive is the most complete structured export mode.

It is mainly intended for:

* diagnostics;
* technical review;
* comparison between exports;
* preservation of metadata;
* advanced backup workflows.

## Notes about media and references

Some conversations may contain references, citations, file citations, images or generated media.

The extension attempts to render or preserve these elements when the required data is available in the conversation data returned by ChatGPT.

If a preview, image, source title or metadata field is not available in the original data, the extension may show a fallback instead of inventing missing information.

## Privacy note

Exported files can contain private conversation content.

Users should review exported files before sharing them publicly or attaching them to bug reports.
