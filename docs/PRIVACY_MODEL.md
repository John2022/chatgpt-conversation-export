# Privacy model

ChatGPT Conversation Export is designed as a local export tool.

The extension exports the current ChatGPT conversation from the active browser tab and saves the result as a local file.

## Local processing

The extension does not operate an external backend.

Exported files are generated locally by the browser extension.

The extension does not upload exported conversations to a third-party server.

## Data handled by the extension

Depending on the selected export mode, exported files may contain:

- user messages;
- assistant messages;
- timestamps when available;
- message metadata when available;
- source references when available;
- file citations when available;
- image metadata or previews when available;
- technical export information.

## Sensitive content

ChatGPT conversations may contain personal, confidential or sensitive information.

Users should review exported files before:

- sharing them publicly;
- attaching them to GitHub issues;
- sending them by email;
- uploading them to another service.

When reporting bugs, users should anonymize private data whenever possible.

## Network access

The extension is intended to work on ChatGPT pages.

It may access ChatGPT conversation data available to the current browser session in order to generate exports.

The extension does not provide its own remote synchronization or cloud storage service.

## Permissions

Requested permissions are limited to the extension functionality:

- access to ChatGPT pages;
- local file downloads;
- extension storage for settings;
- active tab access when needed.

## No analytics

The extension does not include analytics, tracking pixels or advertising code.

## User responsibility

Exported files are local files controlled by the user.

The user is responsible for where exported files are stored, copied, shared or published.
