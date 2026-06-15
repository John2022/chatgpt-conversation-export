# Development notes

ChatGPT Conversation Export is a Firefox WebExtension.

The extension exports the current ChatGPT conversation from the active ChatGPT page to local HTML or JSON files.

## Repository structure

Main extension files are currently located at the repository root.

Important files:

- `manifest.json` — Firefox WebExtension manifest;
- `background.js` — background logic;
- `content_button.js` — integrated ChatGPT page button;
- `inject_backend_export.js` — page-context injection entry point;
- `page_backend_export.js` — main export logic;
- `popup.html` / `popup.js` — toolbar popup;
- `options.html` / `options.js` — options page;
- `i18n_local.js` — local interface translation helper;
- `_locales/` — Firefox localization files;
- `AMO/` — Mozilla Add-ons submission texts;
- `docs/` — project documentation.

## Build model

The extension does not currently use a bundler.

Files are plain WebExtension files and can be inspected directly.

The packaged extension is produced by creating a ZIP/XPI archive with `manifest.json` at the archive root.

## Firefox testing

For temporary local testing:

1. Open Firefox.
2. Go to `about:debugging`.
3. Select `This Firefox`.
4. Click `Load Temporary Add-on`.
5. Select `manifest.json`.

The temporary add-on remains installed until Firefox is closed or the extension is removed from the debugging page.

## Packaging

For Firefox, an XPI package is a ZIP archive with the extension files at the archive root.

The package must not contain an extra parent folder above `manifest.json`.

## Release candidate

Current public release candidate:

- `v1.0.0-rc2`

Manifest version:

- `1.0.0`

## Source review

The project is intentionally kept readable and directly inspectable.

There is no minified or generated production bundle in the current release candidate.

## Development caution

The extension depends on the structure and data made available by ChatGPT pages and backend responses.

ChatGPT interface or backend changes may require updates to extraction or rendering logic.
