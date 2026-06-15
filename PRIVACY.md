# Privacy Policy

ChatGPT Conversation Export is designed to locally export a ChatGPT conversation opened in Firefox.

## Data processed

The extension may read:

- the content of the open ChatGPT conversation;
- conversation metadata available in ChatGPT responses;
- source, image and attachment references when available;
- local extension settings.

## Session token usage

To retrieve the conversation, the extension uses the ChatGPT session already active in the user’s tab.

The session token is used in memory only during the export request. It is not stored by the extension, not sent to a third-party server and not written to exported files.

## Local storage

The extension uses the `storage` permission only to save local settings, for example:

- default export mode;
- default format;
- language;
- theme;
- integrated button position;
- visible actions in the menu.

## No third-party server

The extension does not operate its own server.

It does not send conversations, files, metadata, settings or tokens to a third-party server.

Exported files are generated locally by the browser and downloaded on the user’s device.

## Images and external links

HTML exports may contain links to images or web sources already present in ChatGPT data.

When the user opens an HTML export containing remote images, the browser may load these images from their original domains. This is caused by the exported file and normal browser behavior, not by the extension sending data to its own server.

## Permissions

The extension requests:

```json
[
  "storage",
  "https://chatgpt.com/*"
]
```

`storage` is used only for local extension settings.

Access to `https://chatgpt.com/*` is required to read the open ChatGPT conversation and call ChatGPT APIs from that page.

## Independence

ChatGPT Conversation Export is an unofficial extension. It is not developed, endorsed or affiliated with OpenAI.
