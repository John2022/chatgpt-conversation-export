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

function extensionApi() {
  return typeof browser !== "undefined" ? browser : chrome;
}

function getStorageValues() {
  const api = extensionApi();
  return new Promise(resolve => {
    if (!api.storage || !api.storage.local) {
      resolve({ ...DEFAULT_SETTINGS });
      return;
    }
    api.storage.local.get(DEFAULT_SETTINGS, values => {
      const err = api.runtime && api.runtime.lastError;
      resolve(err ? { ...DEFAULT_SETTINGS } : { ...DEFAULT_SETTINGS, ...(values || {}) });
    });
  });
}

(function () {
  const api = extensionApi();
  const ROOT_ID = "chatgpt-conversation-export-v100rc1-root";

  function msg(key, settings) {
    return typeof CCB_msg === "function" ? CCB_msg(key, settings || {}) : key;
  }

  function formatLabel(format, settings) {
    return format === "html" ? msg("htmlFormat", settings) : msg("jsonFormat", settings);
  }

  function buttonLabel(settings) {
    return msg("buttonTitle", settings);
  }

  function luminanceFromRgb(text) {
    const match = String(text || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) return null;
    const r = Number(match[1]) / 255;
    const g = Number(match[2]) / 255;
    const b = Number(match[3]) / 255;
    const c = v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
  }

  function detectChatGPTTheme() {
    const html = document.documentElement;
    if (html.classList.contains("dark") || html.getAttribute("data-theme") === "dark") return "dark";
    if (html.classList.contains("light") || html.getAttribute("data-theme") === "light") return "light";
    for (const el of [document.body, document.querySelector("main"), html].filter(Boolean)) {
      const lum = luminanceFromRgb(getComputedStyle(el).backgroundColor);
      if (lum !== null) return lum < 0.45 ? "dark" : "light";
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function resolveTheme(settings) {
    if (settings.inPageTheme === "light" || settings.inPageTheme === "dark") return settings.inPageTheme;
    return detectChatGPTTheme();
  }

  function actionKey(mode, format) {
    if (mode === "diagnostic") return "diagnostic";
    return (mode === "export_complete" ? "complete" : "readable") + "_" + format;
  }

  function defaultActionKey(settings) {
    const format = settings.defaultFormat === "json" ? "json" : "html";
    return actionKey("export_readable", format);
  }

  function allActions() {
    return [
      { key: "readable_json", mode: "export_readable", format: "json", group: "readable" },
      { key: "readable_html", mode: "export_readable", format: "html", group: "readable" },
      { key: "complete_json", mode: "export_complete", format: "json", group: "complete" },
      { key: "complete_html", mode: "export_complete", format: "html", group: "complete" },
      { key: "diagnostic", mode: "diagnostic", format: "json", group: "diagnostic" }
    ];
  }

  function visibleKeys(settings) {
    const key = defaultActionKey(settings);
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

  function orderedActions(settings) {
    const keys = visibleKeys(settings);
    const defaultFormat = settings.defaultFormat === "json" ? "json" : "html";
    const orderScore = action => {
      if (action.group === "diagnostic") return 100;
      let score = action.group === "complete" ? 20 : 10;
      if (action.format !== defaultFormat) score += 2;
      return score;
    };
    return allActions()
      .filter(action => keys.has(action.key))
      .sort((a, b) => orderScore(a) - orderScore(b));
  }

  function compactActionLabel(action, settings) {
    if (action.group === "diagnostic") return msg("diagnosticButton", settings);
    const mode = action.group === "complete" ? msg("completeShort", settings) : msg("readableShort", settings);
    return `${mode} ${formatLabel(action.format, settings)}`;
  }

  function injectExport(mode, format, settings) {
    const token = "chatgpt_conversation_export_v100rc1_inline_" + Date.now() + "_" + Math.random().toString(16).slice(2);
    const old = document.getElementById("chatgpt-conversation-export-v100rc1-script");
    if (old) old.remove();
    const script = document.createElement("script");
    script.id = "chatgpt-conversation-export-v100rc1-script";
    script.src = api.runtime.getURL("page_backend_export.js");
    script.dataset.mode = mode;
    script.dataset.format = format;
    script.dataset.settings = JSON.stringify(settings || {});
    script.dataset.token = token;
    window.addEventListener("message", function onMessage(event) {
      if (event.source !== window) return;
      const data = event.data || {};
      if (data.type !== "CHATGPT_CONVERSATION_EXPORT_V100RC1_DONE" || data.token !== token) return;
      window.removeEventListener("message", onMessage);
      script.remove();
    });
    (document.head || document.documentElement).appendChild(script);
  }

  function openSettings() {
    api.runtime.sendMessage({ type: "CHATGPT_CONVERSATION_EXPORT_V100RC1_OPEN_OPTIONS" });
  }

  function clearRoot() {
    const old = document.getElementById(ROOT_ID);
    if (old) old.remove();
  }

  function render(settings) {
    clearRoot();
    if (!location.hostname.endsWith("chatgpt.com")) return;
    if (settings.inPageButton === "disabled") return;
    const actions = orderedActions(settings);
    if (!actions.length) return;

    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("data-position", settings.inPageButton || "top_right");
    root.setAttribute("data-theme", resolveTheme(settings));
    root.setAttribute("data-interface", settings.interfaceMode || "advanced");
    root.innerHTML = `
<style>
#${ROOT_ID}{position:fixed;right:18px;z-index:2147483647;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:12px;pointer-events:none;width:max-content;max-width:calc(100vw - 36px)}
#${ROOT_ID}[data-position="top_right"]{top:76px} #${ROOT_ID}[data-position="bottom_right"]{bottom:22px}
#${ROOT_ID}[data-theme="dark"]{--ccb-bg:rgba(32,33,35,.94);--ccb-bg-hover:rgba(52,53,65,.98);--ccb-panel:rgba(32,33,35,.98);--ccb-fg:#f2f2f2;--ccb-muted:#b8b8b8;--ccb-border:rgba(255,255,255,.16);--ccb-border-hover:rgba(255,255,255,.26);--ccb-action-bg:rgba(255,255,255,.055);--ccb-action-hover:rgba(255,255,255,.11);--ccb-shadow:rgba(0,0,0,.36);--ccb-menu-width:178px}
#${ROOT_ID}[data-theme="light"]{--ccb-bg:rgba(255,255,255,.94);--ccb-bg-hover:rgba(247,247,248,.98);--ccb-panel:rgba(255,255,255,.98);--ccb-fg:#1f2328;--ccb-muted:#5f6368;--ccb-border:rgba(0,0,0,.16);--ccb-border-hover:rgba(0,0,0,.26);--ccb-action-bg:rgba(0,0,0,.035);--ccb-action-hover:rgba(0,0,0,.07);--ccb-shadow:rgba(0,0,0,.18);--ccb-menu-width:178px}
#${ROOT_ID}[data-interface="minimal"]{--ccb-menu-width:132px}
#${ROOT_ID} .ccb-main{pointer-events:auto;display:flex;width:max-content;align-items:center;justify-content:center;gap:6px;min-height:28px;margin-left:auto;background:var(--ccb-bg);color:var(--ccb-fg);border:1px solid var(--ccb-border);border-radius:7px;padding:4px 9px;font-size:12px;line-height:1;font-weight:650;cursor:pointer;box-shadow:0 2px 8px var(--ccb-shadow);backdrop-filter:blur(6px)}
#${ROOT_ID} .ccb-main:hover{background:var(--ccb-bg-hover);border-color:var(--ccb-border-hover)} #${ROOT_ID} .ccb-icon{width:14px;height:14px;flex:0 0 auto;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;opacity:.94}
#${ROOT_ID} .ccb-panel{pointer-events:auto;display:none;position:absolute;right:0;width:var(--ccb-menu-width);max-width:calc(100vw - 36px);box-sizing:border-box;padding:8px;background:var(--ccb-panel);color:var(--ccb-fg);border:1px solid var(--ccb-border);border-radius:10px;box-shadow:0 10px 28px var(--ccb-shadow);backdrop-filter:blur(8px)}
#${ROOT_ID}[data-interface="minimal"] .ccb-panel{padding:7px;border-radius:9px}
#${ROOT_ID}[data-position="top_right"] .ccb-panel{top:35px} #${ROOT_ID}[data-position="bottom_right"] .ccb-panel{bottom:35px} #${ROOT_ID}.open .ccb-panel{display:block}
#${ROOT_ID} .ccb-section{width:100%;margin:0 auto 8px} #${ROOT_ID} .ccb-title{font-size:11px;color:var(--ccb-muted);margin:2px 0 5px;font-weight:700;text-transform:uppercase;letter-spacing:.035em;white-space:nowrap}
#${ROOT_ID} .ccb-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;width:100%;align-items:stretch} #${ROOT_ID} .ccb-row.ccb-row-single{grid-template-columns:1fr} #${ROOT_ID} .ccb-action{appearance:none;width:100%;min-width:0;box-sizing:border-box;border:1px solid var(--ccb-border);border-radius:7px;padding:6px 7px;background:var(--ccb-action-bg);color:var(--ccb-fg);font-size:12px;font-weight:650;text-align:center;cursor:pointer;white-space:nowrap} #${ROOT_ID} .ccb-action:hover{background:var(--ccb-action-hover);border-color:var(--ccb-border-hover)}
#${ROOT_ID} .ccb-panel>.ccb-action:not(.ccb-settings){display:block;width:100%;min-width:0;margin:6px 0 0}
#${ROOT_ID} .ccb-settings{display:block;text-align:center;width:100%;min-width:0;margin:6px 0 0;background:var(--ccb-action-bg);color:var(--ccb-fg)} #${ROOT_ID} .ccb-minimal-row{display:flex;flex-direction:column;gap:6px;align-items:stretch;width:100%} #${ROOT_ID} .ccb-minimal-row .ccb-action{width:100%;min-width:0} #${ROOT_ID} .ccb-minimal-row .ccb-settings{margin-top:0} #${ROOT_ID}[data-interface="minimal"] .ccb-action{padding:7px 8px}
</style>
<button class="ccb-main" type="button" title="ChatGPT Conversation Export"><svg class="ccb-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h12l2 2v16H5z"></path><path d="M8 3v6h8V3"></path><path d="M8 21v-7h8v7"></path><path d="M10 16h4"></path></svg><span class="ccb-label"></span></button><div class="ccb-panel" aria-label="ChatGPT Conversation Export"></div>`;

    root.querySelector(".ccb-label").textContent = buttonLabel(settings);
    const panel = root.querySelector(".ccb-panel");

    function createActionButton(action, compact) {
      const button = document.createElement("button");
      button.className = "ccb-action";
      button.type = "button";
      button.textContent = compact ? compactActionLabel(action, settings) : (action.group === "diagnostic" ? msg("diagnosticButton", settings) : formatLabel(action.format, settings));
      button.addEventListener("click", () => {
        root.classList.remove("open");
        injectExport(action.mode, action.format, settings);
      });
      return button;
    }

    function createSettingsButton(extraClass) {
      const settingsBtn = document.createElement("button");
      settingsBtn.className = "ccb-action ccb-settings" + (extraClass ? " " + extraClass : "");
      settingsBtn.type = "button";
      settingsBtn.textContent = msg("settingsButton", settings);
      settingsBtn.addEventListener("click", openSettings);
      return settingsBtn;
    }

    if (settings.interfaceMode === "minimal") {
      const row = document.createElement("div");
      row.className = "ccb-row ccb-minimal-row";
      row.appendChild(createActionButton(actions[0], true));
      row.appendChild(createSettingsButton());
      panel.appendChild(row);
    } else {
      const groupOrder = ["readable", "complete"];
      function addGroup(kind, titleKey) {
        const groupActions = actions.filter(action => action.group === kind);
        if (!groupActions.length) return;
        const section = document.createElement("div");
        section.className = "ccb-section";
        const title = document.createElement("div");
        title.className = "ccb-title";
        title.textContent = msg(titleKey, settings);
        section.appendChild(title);
        const row = document.createElement("div");
        row.className = "ccb-row" + (groupActions.length === 1 ? " ccb-row-single" : "");
        groupActions.forEach(action => row.appendChild(createActionButton(action, false)));
        section.appendChild(row);
        panel.appendChild(section);
      }
      for (const group of groupOrder) {
        addGroup(group, group === "complete" ? "completeArchive" : "readableConversation");
      }
      actions.filter(action => action.group === "diagnostic").forEach(action => panel.appendChild(createActionButton(action, false)));
      panel.appendChild(createSettingsButton());
    }

    const main = root.querySelector(".ccb-main");
    main.addEventListener("click", () => root.classList.toggle("open"));
    document.addEventListener("click", event => {
      if (!root.contains(event.target)) root.classList.remove("open");
    }, { capture: true });
    document.documentElement.appendChild(root);
  }

  async function init() {
    const settings = await getStorageValues();
    render(settings);
  }

  init();
  if (api.storage && api.storage.onChanged) {
    api.storage.onChanged.addListener((changes, area) => {
      if (area === "local") init();
    });
  }
})();
