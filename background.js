(function () {
  const api = typeof browser !== "undefined" ? browser : chrome;
  if (api.runtime && api.runtime.onMessage) {
    api.runtime.onMessage.addListener((message) => {
      if (message && message.type === "CHATGPT_CONVERSATION_EXPORT_V100RC1_OPEN_OPTIONS") {
        if (api.runtime.openOptionsPage) api.runtime.openOptionsPage();
        return false;
      }
      return false;
    });
  }
})();
