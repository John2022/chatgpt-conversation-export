const DEFAULT_SETTINGS = {
  defaultFormat: "html",
  language: "auto",
  htmlTheme: "auto",
  htmlLayout: "conversation",
  htmlAttachmentLinks: "available",
  inPageTheme: "auto",
  inPageButton: "top_right",
  interfaceMode: "advanced",
  showReadableJson: true,
  showReadableHtml: true,
  showCompleteJson: true,
  showCompleteHtml: true,
  showDiagnostic: true
};
function extensionApi() { return typeof browser !== "undefined" ? browser : chrome; }
function getStorageValues() { const api = extensionApi(); return new Promise(resolve => { if (!api.storage || !api.storage.local) { resolve({ ...DEFAULT_SETTINGS }); return; } api.storage.local.get(DEFAULT_SETTINGS, values => { const err = api.runtime && api.runtime.lastError; resolve(err ? { ...DEFAULT_SETTINGS } : { ...DEFAULT_SETTINGS, ...(values || {}) }); }); }); }
(function () {
  const api = extensionApi();
  const status = document.getElementById("status");
  let currentSettings = { ...DEFAULT_SETTINGS };
  function msg(key, substitutions) { return typeof CCB_msg === "function" ? CCB_msg(key, currentSettings, substitutions) : key; }
  function setStatus(text) { status.textContent = text; }
  function getActiveTab() { return new Promise((resolve, reject) => { api.tabs.query({ active: true, currentWindow: true }, tabs => { const err = api.runtime.lastError; if (err) reject(err); else resolve(tabs && tabs[0]); }); }); }
  function executeCode(tabId, code) { return new Promise((resolve, reject) => { api.tabs.executeScript(tabId, { code }, result => { const err = api.runtime.lastError; if (err) reject(err); else resolve(result); }); }); }
  function executeFile(tabId, file) { return new Promise((resolve, reject) => { api.tabs.executeScript(tabId, { file }, result => { const err = api.runtime.lastError; if (err) reject(err); else resolve(result); }); }); }
  function actionKey(mode, format) { if (mode === "diagnostic") return "diagnostic"; return (mode === "export_complete" ? "complete" : "readable") + "_" + format; }
  function getVisibleActions(settings) {
    const key = actionKey("export_readable", settings.defaultFormat || "html");
    if (settings.interfaceMode === "minimal") return new Set([key]);
    if (settings.interfaceMode === "standard") return new Set(["readable_json", "readable_html"]);
    if (settings.interfaceMode === "custom") {
      const set = new Set();
      if (settings.showReadableJson) set.add("readable_json");
      if (settings.showReadableHtml) set.add("readable_html");
      if (settings.showCompleteJson) set.add("complete_json");
      if (settings.showCompleteHtml) set.add("complete_html");
      if (settings.showDiagnostic) set.add("diagnostic");
      return set;
    }
    return new Set(["readable_json", "readable_html", "complete_json", "complete_html", "diagnostic"]);
  }
  function applyVisibility() {
    const visible = getVisibleActions(currentSettings);
    document.querySelectorAll("[data-export-action]").forEach(el => { el.style.display = visible.has(el.getAttribute("data-export-action")) ? "block" : "none"; });
    const readableVisible = visible.has("readable_json") || visible.has("readable_html");
    const completeVisible = visible.has("complete_json") || visible.has("complete_html");
    document.getElementById("groupReadable").style.display = readableVisible ? "block" : "none";
    document.getElementById("groupComplete").style.display = completeVisible ? "block" : "none";
  }
  async function run(mode, format) {
    try {
      setStatus(msg("injecting"));
      const tab = await getActiveTab();
      if (!tab || !tab.url || !tab.url.startsWith("https://chatgpt.com/")) { setStatus(msg("notChatGPTTab")); return; }
      currentSettings = { ...DEFAULT_SETTINGS, ...(await getStorageValues()) };
      const code = [`window.__CHATGPT_CONVERSATION_EXPORT_V100RC1_MODE = ${JSON.stringify(mode)};`, `window.__CHATGPT_CONVERSATION_EXPORT_V100RC1_FORMAT = ${JSON.stringify(format)};`, `window.__CHATGPT_CONVERSATION_EXPORT_V100RC1_SETTINGS = ${JSON.stringify(currentSettings)};`].join("\n");
      await executeCode(tab.id, code);
      await executeFile(tab.id, "inject_backend_export.js");
      setStatus(msg("scriptInjected"));
      window.close();
    } catch (err) { setStatus(msg("injectionError", [err && err.message ? err.message : String(err)])); }
  }
  function openSettings() { if (api.runtime.openOptionsPage) api.runtime.openOptionsPage(); else window.open(api.runtime.getURL("options.html")); }
  async function init() { currentSettings = { ...DEFAULT_SETTINGS, ...(await getStorageValues()) }; if (typeof CCB_localizeDocument === "function") CCB_localizeDocument(currentSettings); applyVisibility(); }
  init();
  document.getElementById("readableJson").addEventListener("click", () => run("export_readable", "json"));
  document.getElementById("readableHtml").addEventListener("click", () => run("export_readable", "html"));
  document.getElementById("completeJson").addEventListener("click", () => run("export_complete", "json"));
  document.getElementById("completeHtml").addEventListener("click", () => run("export_complete", "html"));
  document.getElementById("diag").addEventListener("click", () => run("diagnostic", "json"));
  document.getElementById("settings").addEventListener("click", openSettings);
})();
