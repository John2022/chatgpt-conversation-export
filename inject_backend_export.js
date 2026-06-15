(function () {
  const mode = window.__CHATGPT_CONVERSATION_EXPORT_V100RC1_MODE || "export_readable";
  const format = window.__CHATGPT_CONVERSATION_EXPORT_V100RC1_FORMAT || "json";
  const settings = window.__CHATGPT_CONVERSATION_EXPORT_V100RC1_SETTINGS || {};
  const token = "chatgpt_conversation_export_v100rc3_" + Date.now() + "_" + Math.random().toString(16).slice(2);

  const existing = document.getElementById("chatgpt-conversation-export-v100rc3-script");
  if (existing) existing.remove();

  const script = document.createElement("script");
  script.id = "chatgpt-conversation-export-v100rc3-script";
  script.src = browser.runtime.getURL("page_backend_export.js");
  script.dataset.mode = mode;
  script.dataset.format = format;
  script.dataset.settings = JSON.stringify(settings || {});
  script.dataset.token = token;

  window.addEventListener("message", function onMessage(event) {
    if (event.source !== window) return;
    const data = event.data || {};
    if (data.type !== "CHATGPT_CONVERSATION_EXPORT_V100RC1_DONE") return;
    if (data.token !== token) return;
    window.removeEventListener("message", onMessage);
    script.remove();
  });

  (document.head || document.documentElement).appendChild(script);
})();
