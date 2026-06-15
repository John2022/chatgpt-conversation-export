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

function getStorageValues() {
  const api = extensionApi();
  return new Promise(resolve => {
    if (!api.storage || !api.storage.local) { resolve({ ...DEFAULT_SETTINGS }); return; }
    api.storage.local.get(DEFAULT_SETTINGS, values => {
      const err = api.runtime && api.runtime.lastError;
      resolve(err ? { ...DEFAULT_SETTINGS } : { ...DEFAULT_SETTINGS, ...(values || {}) });
    });
  });
}

function saveStorageValues(values) {
  const api = extensionApi();
  return new Promise((resolve, reject) => {
    api.storage.local.set(values, () => {
      const err = api.runtime && api.runtime.lastError;
      if (err) reject(err); else resolve();
    });
  });
}

let currentSettings = { ...DEFAULT_SETTINGS };
let statusTimer = null;
let saveGeneration = 0;

function msg(key, substitutions, settings) {
  return typeof CCB_msg === "function" ? CCB_msg(key, settings || currentSettings, substitutions) : key;
}

function resolveOptionsTheme(settings) {
  if (settings && (settings.inPageTheme === "light" || settings.inPageTheme === "dark")) return settings.inPageTheme;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyOptionsTheme(settings) {
  document.documentElement.setAttribute("data-theme", resolveOptionsTheme(settings || DEFAULT_SETTINGS));
}

function readFormSettings() {
  return {
    defaultFormat: document.getElementById("defaultFormat").value,
    language: document.getElementById("language").value,
    htmlTheme: document.getElementById("htmlTheme").value,
    htmlLayout: document.getElementById("htmlLayout").value,
    htmlAttachmentLinks: document.getElementById("htmlAttachmentLinks").value,
    inPageTheme: document.getElementById("inPageTheme").value,
    inPageButton: document.getElementById("inPageButton").value,
    interfaceMode: document.getElementById("interfaceMode").value,
    showReadableJson: document.getElementById("showReadableJson").checked,
    showReadableHtml: document.getElementById("showReadableHtml").checked,
    showCompleteJson: document.getElementById("showCompleteJson").checked,
    showCompleteHtml: document.getElementById("showCompleteHtml").checked,
    showDiagnostic: document.getElementById("showDiagnostic").checked
  };
}

function fillForm(settings) {
  for (const key of ["defaultFormat","language","htmlTheme","htmlLayout","htmlAttachmentLinks","inPageTheme","inPageButton","interfaceMode"]) {
    const el = document.getElementById(key);
    if (el) el.value = settings[key];
  }
  for (const key of ["showReadableJson","showReadableHtml","showCompleteJson","showCompleteHtml","showDiagnostic"]) {
    const el = document.getElementById(key);
    if (el) el.checked = !!settings[key];
  }
}

function localize(settings) {
  currentSettings = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  if (typeof CCB_localizeDocument === "function") CCB_localizeDocument(currentSettings);
}

function updateVisibleActionsSection(settings) {
  const section = document.getElementById("visibleActionsSection");
  if (!section) return;
  const isCustom = settings && settings.interfaceMode === "custom";
  section.classList.toggle("is-hidden", !isCustom);
  section.setAttribute("aria-hidden", isCustom ? "false" : "true");
}

function updateDefaultFormatSection(settings) {
  const section = document.getElementById("defaultFormatSetting");
  if (!section) return;
  const isMinimal = settings && settings.interfaceMode === "minimal";
  section.classList.toggle("is-hidden", !isMinimal);
  section.setAttribute("aria-hidden", isMinimal ? "false" : "true");
}

function updateConditionalSections(settings) {
  updateVisibleActionsSection(settings);
  updateDefaultFormatSection(settings);
}

function applySettingsToPage(settings) {
  applyOptionsTheme(settings);
  localize(settings);
  updateConditionalSections(settings);
}

function showSavedStatus(settings, generation) {
  const status = document.getElementById("status");
  if (!status) return;
  status.textContent = msg("settingsSaved", null, settings);
  if (statusTimer) clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    if (generation === saveGeneration) status.textContent = "";
  }, 1800);
}

async function persistCurrentForm() {
  const generation = ++saveGeneration;
  currentSettings = { ...DEFAULT_SETTINGS, ...readFormSettings() };
  applySettingsToPage(currentSettings);
  try {
    await saveStorageValues(currentSettings);
    showSavedStatus(currentSettings, generation);
  } catch (error) {
    const status = document.getElementById("status");
    if (status) status.textContent = error && error.message ? error.message : String(error || "Error");
  }
}

(async function () {
  applyOptionsTheme(DEFAULT_SETTINGS);
  localize(DEFAULT_SETTINGS);

  currentSettings = { ...DEFAULT_SETTINGS, ...(await getStorageValues()) };
  fillForm(currentSettings);
  applySettingsToPage(currentSettings);

  document.querySelectorAll("select, input[type='checkbox']").forEach(element => {
    element.addEventListener("change", persistCurrentForm);
  });
})();
