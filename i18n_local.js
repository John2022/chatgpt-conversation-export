// Localizable strings with manual language override support.
// Firefox's browser.i18n API follows the browser UI language only; this helper also respects the extension setting.
const CCB_I18N_MESSAGES = {
  "en": {
    "extensionName": "ChatGPT Conversation Export",
    "extensionDescription": "Export the current ChatGPT conversation as JSON or HTML using ChatGPT's authenticated backend API.",
    "exportReadableJsonButton": "Readable conversation — JSON",
    "exportReadableHtmlButton": "Readable conversation — HTML",
    "exportCompleteJsonButton": "Complete archive — JSON",
    "exportCompleteHtmlButton": "Complete archive — HTML",
    "diagnosticButton": "API diagnostic",
    "settingsButton": "Settings",
    "statusReady": "v1.0.0-rc2 — backend API + session token.",
    "hint": "Readable: for reading or continuing a conversation. Complete archive: includes internal messages and metadata.",
    "injecting": "Injecting script...",
    "notChatGPTTab": "Error: the active tab is not a ChatGPT page.",
    "scriptInjected": "Script injected. Check the ChatGPT page and the Downloads folder.",
    "injectionError": "Injection error: $ERROR$",
    "popupTitle": "ChatGPT Conversation Export",
    "buttonTitle": "Export",
    "settingsTitle": "ChatGPT Conversation Export Settings",
    "settingsSaved": "Settings saved.",
    "settingsAutoSaveNote": "Changes are saved automatically.",
    "defaultFormat": "Default format",
    "language": "Language",
    "htmlTheme": "HTML export theme",
    "inPageButton": "Button integrated into ChatGPT",
    "readableConversation": "Readable conversation",
    "completeArchive": "Complete archive",
    "jsonFormat": "JSON",
    "htmlFormat": "HTML",
    "auto": "Automatic",
    "english": "English",
    "french": "French",
    "light": "Light",
    "dark": "Dark",
    "topRight": "Top right",
    "bottomRight": "Bottom right",
    "disabled": "None",
    "saveSettings": "Save settings",
    "privacyTitle": "Permissions and privacy",
    "privacyText": "The extension runs only on chatgpt.com. It reads the currently open ChatGPT conversation through ChatGPT’s authenticated backend API and exports it locally. It does not send conversations, files, metadata, or tokens to any third-party server. The session token is used only in memory during export and is never written to exported files.",
    "openSettings": "Open settings",
    "attachmentsSummary": "Attachments",
    "inPageTheme": "Integrated button theme",
    "sameAsChatGPT": "Automatic, same as ChatGPT",
    "messageDate": "Message",
    "updatedDate": "Updated",
    "codeBlock": "Code",
    "copyButton": "Copy",
    "copiedButton": "Copied",
    "exportedAt": "Exported at",
    "messagesLabel": "Messages",
    "userSpeaker": "User",
    "chatgptSpeaker": "ChatGPT",
    "metadataLabel": "Metadata",
    "urlLabel": "URL",
    "formatLabel": "Format",
    "languageLabel": "Language",
    "jsonFormatLabel": "JSON",
    "htmlFormatLabel": "HTML",
    "readableConversationTitle": "Readable conversation",
    "completeArchiveTitle": "Complete archive",
    "interfaceMode": "Integrated button mode",
    "interfaceModeMinimal": "Minimal",
    "interfaceModeStandard": "Standard",
    "interfaceModeAdvanced": "Advanced",
    "interfaceModeCustom": "Custom",
    "visibleActions": "Visible actions",
    "showReadableJson": "Readable conversation — JSON",
    "showReadableHtml": "Readable conversation — HTML",
    "showCompleteJson": "Complete archive — JSON",
    "showCompleteHtml": "Complete archive — HTML",
    "showDiagnostic": "API diagnostic",
    "htmlLayout": "HTML message layout",
    "htmlLayoutFull": "Full width",
    "htmlLayoutConversation": "Conversation, ChatGPT left / user right",
    "htmlAttachmentLinks": "Attachment download links in HTML",
    "htmlAttachmentLinksAvailable": "Show when a direct link is available",
    "htmlAttachmentLinksDisabled": "Disabled",
    "downloadAttachment": "Download",
    "linkUnavailable": "No direct link",
    "minimalDefaultAction": "Default action",
    "standardModeHelp": "“Minimal” shows only the default export action. “Standard” shows readable exports only. “Advanced” shows all export modes. “Custom” uses the checkboxes below.",
    "defaultFormatHelp": "Used by “Minimal” mode to choose the single visible readable export.",
    "readableShort": "Readable",
    "completeShort": "Archive",
    "attachmentsNote": "Some attachment links may require an active ChatGPT session.",
    "copyMessageButton": "Copy message",
    "copyCodeButton": "Copy code"
  },
  "fr": {
    "extensionName": "ChatGPT Conversation Export",
    "extensionDescription": "Exporte la conversation ChatGPT ouverte en JSON ou HTML via l’API backend authentifiée de ChatGPT.",
    "exportReadableJsonButton": "Conversation lisible — JSON",
    "exportReadableHtmlButton": "Conversation lisible — HTML",
    "exportCompleteJsonButton": "Archive complète — JSON",
    "exportCompleteHtmlButton": "Archive complète — HTML",
    "diagnosticButton": "Diagnostic API",
    "settingsButton": "Paramètres",
    "statusReady": "v1.0.0-rc1 — API backend + token session.",
    "hint": "Conversation lisible : pour relire ou reprendre une conversation. Archive complète : inclut messages internes et métadonnées.",
    "injecting": "Injection en cours...",
    "notChatGPTTab": "Erreur : l’onglet actif n’est pas une page ChatGPT.",
    "scriptInjected": "Script injecté. Vérifier la page ChatGPT et le dossier Téléchargements.",
    "injectionError": "Erreur injection : $ERROR$",
    "popupTitle": "ChatGPT Conversation Export",
    "buttonTitle": "Export",
    "settingsTitle": "Paramètres de ChatGPT Conversation Export",
    "settingsSaved": "Paramètres enregistrés.",
    "settingsAutoSaveNote": "Les modifications sont enregistrées automatiquement.",
    "defaultFormat": "Format par défaut",
    "language": "Langue",
    "htmlTheme": "Thème de l’export HTML",
    "inPageButton": "Bouton intégré à ChatGPT",
    "readableConversation": "Conversation lisible",
    "completeArchive": "Archive complète",
    "jsonFormat": "JSON",
    "htmlFormat": "HTML",
    "auto": "Automatique",
    "english": "Anglais",
    "french": "Français",
    "light": "Clair",
    "dark": "Sombre",
    "topRight": "Haut à droite",
    "bottomRight": "Bas à droite",
    "disabled": "Aucun",
    "saveSettings": "Enregistrer les paramètres",
    "privacyTitle": "Autorisations et confidentialité",
    "privacyText": "L’extension s’exécute uniquement sur chatgpt.com. Elle lit la conversation ChatGPT actuellement ouverte via l’API backend authentifiée de ChatGPT, puis l’exporte localement. Elle n’envoie pas les conversations, fichiers, métadonnées ou tokens vers un serveur tiers. Le token de session est utilisé uniquement en mémoire pendant l’export et n’est jamais écrit dans les fichiers exportés.",
    "openSettings": "Ouvrir les paramètres",
    "attachmentsSummary": "Fichiers joints",
    "inPageTheme": "Thème du bouton intégré",
    "sameAsChatGPT": "Automatique, comme ChatGPT",
    "messageDate": "Message",
    "updatedDate": "Mis à jour",
    "codeBlock": "Code",
    "copyButton": "Copier",
    "copiedButton": "Copié",
    "exportedAt": "Exporté le",
    "messagesLabel": "Messages",
    "userSpeaker": "Utilisateur",
    "chatgptSpeaker": "ChatGPT",
    "metadataLabel": "Métadonnées",
    "urlLabel": "URL",
    "formatLabel": "Format",
    "languageLabel": "Langue",
    "jsonFormatLabel": "JSON",
    "htmlFormatLabel": "HTML",
    "readableConversationTitle": "Conversation lisible",
    "completeArchiveTitle": "Archive complète",
    "interfaceMode": "Mode du bouton intégré",
    "interfaceModeMinimal": "Minimal",
    "interfaceModeStandard": "Standard",
    "interfaceModeAdvanced": "Avancé",
    "interfaceModeCustom": "Personnalisé",
    "visibleActions": "Actions visibles",
    "showReadableJson": "Conversation lisible — JSON",
    "showReadableHtml": "Conversation lisible — HTML",
    "showCompleteJson": "Archive complète — JSON",
    "showCompleteHtml": "Archive complète — HTML",
    "showDiagnostic": "Diagnostic API",
    "htmlLayout": "Disposition des messages HTML",
    "htmlLayoutFull": "Pleine largeur",
    "htmlLayoutConversation": "Conversation, ChatGPT à gauche / utilisateur à droite",
    "htmlAttachmentLinks": "Liens de téléchargement des fichiers joints dans le HTML",
    "htmlAttachmentLinksAvailable": "Afficher si un lien direct est disponible",
    "htmlAttachmentLinksDisabled": "Désactivés",
    "downloadAttachment": "Télécharger",
    "linkUnavailable": "Aucun lien direct",
    "minimalDefaultAction": "Action par défaut",
    "standardModeHelp": "« Minimal » affiche uniquement l’action d’export par défaut. « Standard » affiche seulement les exports lisibles. « Avancé » affiche tous les modes d’export. « Personnalisé » utilise les cases ci-dessous.",
    "defaultFormatHelp": "Utilisé par le mode « Minimal » pour choisir l’unique export lisible visible.",
    "readableShort": "Lisible",
    "completeShort": "Archive",
    "attachmentsNote": "Certains liens de fichiers joints peuvent nécessiter une session ChatGPT active.",
    "copyMessageButton": "Copier le message",
    "copyCodeButton": "Copier le code"
  }
};

function CCB_extensionApi() {
  return typeof browser !== "undefined" ? browser : chrome;
}

function CCB_resolveLanguage(settings) {
  const forced = settings && settings.language;
  if (forced === "en" || forced === "fr") return forced;
  try {
    const api = CCB_extensionApi();
    const uiLang = api.i18n && api.i18n.getUILanguage ? api.i18n.getUILanguage() : "";
    if (String(uiLang || "").toLowerCase().startsWith("fr")) return "fr";
  } catch (_) {}
  return String(navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
}

function CCB_msg(key, settings, substitutions) {
  const lang = CCB_resolveLanguage(settings || {});
  let text = (CCB_I18N_MESSAGES[lang] && CCB_I18N_MESSAGES[lang][key]) || (CCB_I18N_MESSAGES.en && CCB_I18N_MESSAGES.en[key]) || key;
  if (Array.isArray(substitutions)) {
    substitutions.forEach((value, index) => {
      const pattern = new RegExp("\\$" + (index + 1), "g");
      text = text.replace(pattern, String(value));
    });
  }
  return text;
}

function CCB_localizeDocument(settings) {
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.getAttribute("data-i18n");
    const translated = CCB_msg(key, settings);
    if (translated) element.textContent = translated;
  });
  const titleNode = document.querySelector("title[data-i18n]");
  if (titleNode) document.title = CCB_msg(titleNode.getAttribute("data-i18n"), settings);
  document.documentElement.setAttribute("lang", CCB_resolveLanguage(settings));
}
