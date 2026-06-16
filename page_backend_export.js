(async function () {
  const current = document.currentScript;
  const mode = current?.dataset?.mode || "export_readable";
  const exportFormat = current?.dataset?.format || "json";
  const token = current?.dataset?.token || null;
  let settings = {};
  try { settings = JSON.parse(current?.dataset?.settings || "{}"); } catch (_) { settings = {}; }

  const translations = {
    en: {
      conversationIdMissing: "Conversation identifier not found. Diagnostic downloaded.",
      apiUnavailable: "ChatGPT API unavailable",
      diagnosticDownloaded: "Diagnostic downloaded.",
      backendExportError: "Backend export error. Diagnostic downloaded.",
      exportFinished: "Export complete.",
      mode: "Mode",
      readableConversation: "readable conversation",
      completeArchive: "complete archive",
      messagesExported: "Messages exported",
      internalMessagesExcluded: "Internal messages excluded",
      emptyEntriesIgnored: "Empty entries ignored",
      method: "Method",
      backendApi: "backend API",
      exportedAt: "Exported at",
      messagesLabel: "Messages",
      userSpeaker: "User",
      chatgptSpeaker: "ChatGPT",
      attachments: "Attachments",
      metadataLabel: "Metadata",
      copyButton: "Copy",
      copiedButton: "Copied",
      messageDate: "Message",
      updatedDate: "Updated",
      readableConversationTitle: "Readable conversation",
      completeArchiveTitle: "Complete archive",
      jsonFormat: "JSON",
      htmlFormat: "HTML",
      urlLabel: "URL",
      downloadAttachment: "Download",
      linkUnavailable: "No direct link",
      imagesLabel: "Images",
      imageGroupLabel: "Image group",
      imageQueriesLabel: "Search queries",
      imagePreviewUnavailable: "No direct image preview available",
      imageGroupPreviewUnavailable: "No direct preview URL available in the export data",
      galleryAboutLabel: "About this gallery",
      galleryLocationLabel: "Location",
      galleryContentLabel: "Content",
      galleryImagesLabel: "Images",
      gallerySourcesLabel: "Sources",
      galleryImagesDisplayed: "displayed",
      openImage: "Open image",
      sourceLabel: "source",
      sourcesLabel: "sources",
      sourcePreviewLabel: "Source preview",
      sourceDetailsLabel: "Source details",
      sourceUnavailable: "Source details unavailable in the exported data",
      openSource: "Open source",
      supportingSources: "Related sources",
      closeLabel: "Close",
      fileLabel: "file",
      fileCitationLabel: "file",
      fileLineRangeLabel: "lines",
      fileUnavailable: "File details unavailable in the exported data"
    },
    fr: {
      conversationIdMissing: "Identifiant de conversation introuvable. Diagnostic téléchargé.",
      apiUnavailable: "API ChatGPT non exploitable",
      diagnosticDownloaded: "Diagnostic téléchargé.",
      backendExportError: "Erreur export backend. Diagnostic téléchargé.",
      exportFinished: "Export terminé.",
      mode: "Mode",
      readableConversation: "conversation lisible",
      completeArchive: "archive complète",
      messagesExported: "Messages exportés",
      internalMessagesExcluded: "Messages internes exclus",
      emptyEntriesIgnored: "Entrées sans contenu ignorées",
      method: "Méthode",
      backendApi: "API backend",
      exportedAt: "Exporté le",
      messagesLabel: "Messages",
      userSpeaker: "Utilisateur",
      chatgptSpeaker: "ChatGPT",
      attachments: "Fichiers joints",
      metadataLabel: "Métadonnées",
      copyButton: "Copier",
      copiedButton: "Copié",
      messageDate: "Message",
      updatedDate: "Mis à jour",
      readableConversationTitle: "Conversation lisible",
      completeArchiveTitle: "Archive complète",
      jsonFormat: "JSON",
      htmlFormat: "HTML",
      urlLabel: "URL",
      downloadAttachment: "Télécharger",
      linkUnavailable: "Aucun lien direct",
      imagesLabel: "Images",
      imageGroupLabel: "Groupe d’images",
      imageQueriesLabel: "Recherches d’images",
      imagePreviewUnavailable: "Aucun aperçu direct disponible",
      imageGroupPreviewUnavailable: "Aucune URL d’aperçu directe dans les données exportées",
      galleryAboutLabel: "À propos de cette galerie",
      galleryLocationLabel: "Lieu",
      galleryContentLabel: "Contenu",
      galleryImagesLabel: "Images",
      gallerySourcesLabel: "Sources",
      galleryImagesDisplayed: "affichées",
      openImage: "Ouvrir l’image",
      sourceLabel: "source",
      sourcesLabel: "sources",
      sourcePreviewLabel: "Aperçu de la source",
      sourceDetailsLabel: "Détails de la source",
      sourceUnavailable: "Détails de source indisponibles dans les données exportées",
      openSource: "Ouvrir la source",
      supportingSources: "Sources associées",
      closeLabel: "Fermer",
      fileLabel: "fichier",
      fileCitationLabel: "fichier",
      fileLineRangeLabel: "lignes",
      fileUnavailable: "Détails de fichier indisponibles dans les données exportées"
    }
  };

  function lang() {
    if (settings.language === "fr" || settings.language === "en") return settings.language;
    return String(navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
  }

  function t(key) {
    const l = lang();
    return translations[l][key] || translations.en[key] || key;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatDate(date = new Date()) {
    return (
      date.getFullYear() + "." +
      pad(date.getMonth() + 1) + "." +
      pad(date.getDate()) + "-" +
      pad(date.getHours()) + "h" +
      pad(date.getMinutes()) + "m" +
      pad(date.getSeconds()) + "s"
    );
  }

  function downloadText(text, filename, mimeType) {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
  }

  function downloadJSON(data, filename) {
    downloadText(JSON.stringify(data, null, 2), filename, "application/json;charset=utf-8");
  }

  function downloadHTML(data, filename) {
    downloadText(renderHTML(data), filename, "text/html;charset=utf-8");
  }

  function finish(payload) {
    window.postMessage({ type: "CHATGPT_CONVERSATION_EXPORT_V100RC1_DONE", token, payload }, "*");
  }

  function getConversationId() {
    const href = location.href;
    const path = location.pathname;
    let match = path.match(/\/c\/([^/?#]+)/) || href.match(/\/c\/([^/?#]+)/);
    if (match && match[1]) return match[1];
    match = href.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return match ? match[0] : null;
  }

  function speakerFromRole(role) {
    if (role === "user") return t("userSpeaker");
    if (role === "assistant") return t("chatgptSpeaker");
    return role || "unknown";
  }

  function extractTextFromContent(content) {
    if (!content) return "";
    if (typeof content === "string") return content;

    if (Array.isArray(content.parts)) {
      return content.parts.map(part => {
        if (typeof part === "string") return part;
        if (!part || typeof part !== "object") return String(part ?? "");

        if (part.content_type === "image_asset_pointer") {
          return lang() === "fr"
            ? `[Image jointe : ${part.asset_pointer || "image"}]`
            : `[Attached image: ${part.asset_pointer || "image"}]`;
        }
        if (part.content_type === "file_asset_pointer") {
          return lang() === "fr"
            ? `[Fichier joint : ${part.asset_pointer || part.file_id || "fichier"}]`
            : `[Attached file: ${part.asset_pointer || part.file_id || "file"}]`;
        }
        if (part.content_type === "audio_asset_pointer") {
          return lang() === "fr"
            ? `[Audio joint : ${part.asset_pointer || "audio"}]`
            : `[Attached audio: ${part.asset_pointer || "audio"}]`;
        }
        return JSON.stringify(part);
      }).join("\n");
    }

    return JSON.stringify(content);
  }

  function extractAttachments(message) {
    const attachments = [];

    const metadataAttachments = message?.metadata?.attachments;
    if (Array.isArray(metadataAttachments)) {
      for (const att of metadataAttachments) {
        attachments.push({
          name: att.name || att.file_name || att.filename || att.title || null,
          type: att.mime_type || att.type || null,
          id: att.id || att.file_id || att.asset_pointer || null,
          url: att.url || null,
          raw: att
        });
      }
    }

    const parts = message?.content?.parts;
    if (Array.isArray(parts)) {
      for (const part of parts) {
        if (part && typeof part === "object") {
          if (part.content_type === "image_asset_pointer" || part.content_type === "file_asset_pointer" || part.content_type === "audio_asset_pointer") {
            attachments.push({
              name: part.name || part.filename || part.content_type || null,
              type: part.content_type || null,
              id: part.asset_pointer || part.file_id || null,
              url: part.url || null,
              raw: part
            });
          }
        }
      }
    }

    return attachments;
  }


  function parseImageGroupPayload(payloadText) {
    const raw = String(payloadText || "").trim();
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      const queries = Array.isArray(parsed.query)
        ? parsed.query.map(item => String(item || "").trim()).filter(Boolean)
        : [];
      const aspectRatio = parsed.aspect_ratio || null;
      return { queries, aspect_ratio: aspectRatio, raw: parsed, images: [] };
    } catch (_) {
      return { queries: [], aspect_ratio: null, raw: raw, images: [] };
    }
  }

  function extractImageGroupsFromContent(content) {
    const groups = [];
    const pattern = /(image_group|i)([\s\S]*?)/g;
    let match;
    while ((match = pattern.exec(String(content || ""))) !== null) {
      const kind = match[1];
      const payload = match[2];
      const group = kind === "image_group"
        ? parseImageGroupPayload(payload)
        : { queries: [], aspect_ratio: null, raw: payload, images: [], kind: "image_v2" };
      if (group) {
        group.token = match[0];
        group.kind = group.kind || kind;
        groups.push(group);
      }
    }
    return groups;
  }

  function normalizeWebSourceItem(item = {}) {
    if (!item || typeof item !== "object") return null;
    const url = item.url || item.href || item.link || item.source_url || item.sourceUrl || null;
    const title = item.title || item.name || item.attribution || url || null;
    if (!title && !url) return null;
    const supporting = Array.isArray(item.supporting_websites)
      ? item.supporting_websites.map(normalizeWebSourceItem).filter(Boolean)
      : [];
    return {
      title: title || null,
      url: url || null,
      attribution: item.attribution || item.site_name || item.domain || null,
      snippet: item.snippet || item.description || item.text || null,
      pub_date: item.pub_date || null,
      refs: Array.isArray(item.refs) ? item.refs : [],
      supporting_websites: supporting
    };
  }

  function refObjectToId(ref = {}) {
    if (!ref || typeof ref !== "object") return null;
    const turn = Number.isFinite(Number(ref.turn_index)) ? `turn${Number(ref.turn_index)}` : null;
    const type = ref.ref_type || ref.type || "search";
    const index = Number.isFinite(Number(ref.ref_index)) ? Number(ref.ref_index) : null;
    if (!turn || index === null) return null;
    return `${turn}${type}${index}`;
  }

  function citationIdsFromToken(token) {
    return String(token || "")
      .replace(/^cite/, "")
      .replace(/$/, "")
      .split("")
      .map(item => item.trim())
      .filter(Boolean);
  }

  function normalizeImageReferenceImage(image = {}) {
    if (!image || typeof image !== "object") return null;
    const preview = image.thumbnail_url || image.content_url || image.image_url || image.original_content_url || image.url || null;
    const full = image.content_url || image.original_content_url || image.thumbnail_url || image.url || null;
    const sourceUrl = image.url && isHttpUrl(image.url) ? image.url : (image.original_content_url && isHttpUrl(image.original_content_url) ? image.original_content_url : null);
    if (!preview && !full && !sourceUrl) return null;
    return {
      url: full || preview || sourceUrl,
      preview_url: preview || full || sourceUrl,
      thumbnail_url: image.thumbnail_url || null,
      content_url: image.content_url || null,
      title: image.title || image.alt || image.caption || image.attribution || null,
      source_url: sourceUrl,
      attribution: image.attribution || null,
      width: image.content_size?.width || image.thumbnail_size?.width || image.width || null,
      height: image.content_size?.height || image.thumbnail_size?.height || image.height || null
    };
  }

  function imageQueriesFromReference(ref = {}) {
    const text = String(ref.prompt_text || ref.alt || "");
    const titles = Array.isArray(ref.images) ? ref.images.map(image => image?.title).filter(Boolean) : [];
    const promptTitles = [];
    text.replace(/!\[([^\]]+)\]\(/g, (_m, title) => {
      if (title) promptTitles.push(title);
      return "";
    });
    return [...promptTitles, ...titles].map(item => String(item || "").trim()).filter(Boolean);
  }

  function extractReadableReferences(metadata = {}) {
    const contentReferences = Array.isArray(metadata.content_references) ? metadata.content_references : [];
    const sourceReferences = [];
    const entityReferences = [];
    const fileReferences = [];
    const imageReferences = [];

    for (const ref of contentReferences) {
      if (!ref || typeof ref !== "object") continue;
      if (ref.type === "grouped_webpages" || ref.type === "webpage" || ref.type === "webpages") {
        const matchedText = ref.matched_text || null;
        const items = Array.isArray(ref.items) ? ref.items.map(normalizeWebSourceItem).filter(Boolean) : [];
        const fallbackItems = Array.isArray(ref.fallback_items) ? ref.fallback_items.map(normalizeWebSourceItem).filter(Boolean) : [];
        const safeUrls = Array.isArray(ref.safe_urls) ? ref.safe_urls.filter(url => /^https?:\/\//i.test(String(url || ""))) : [];
        const refIds = new Set(citationIdsFromToken(matchedText));
        for (const item of [...items, ...fallbackItems]) {
          for (const rawRef of item.refs || []) {
            const id = refObjectToId(rawRef);
            if (id) refIds.add(id);
          }
        }
        if (matchedText || items.length || safeUrls.length) {
          sourceReferences.push({
            token: matchedText,
            refs: Array.from(refIds),
            safe_urls: safeUrls,
            alt: ref.alt || null,
            items,
            fallback_items: fallbackItems,
            type: ref.type,
            status: ref.status || null
          });
        }
      } else if (ref.type === "file") {
        const inputPointer = ref.input_pointer && typeof ref.input_pointer === "object" ? ref.input_pointer : {};
        const lineStart = ref.page_range_start || inputPointer.line_range_start || null;
        const lineEnd = ref.page_range_end || inputPointer.line_range_end || null;
        fileReferences.push({
          token: ref.matched_text || null,
          name: ref.name || ref.alt || null,
          id: ref.id || ref.library_file_id || null,
          source: ref.source || null,
          snippet: ref.snippet || null,
          url: /^https?:\/\//i.test(String(ref.cloud_doc_url || "")) ? ref.cloud_doc_url : null,
          line_start: lineStart,
          line_end: lineEnd,
          input_pointer: inputPointer
        });
      } else if (ref.type === "entity") {
        const entityData = ref.entity_data && typeof ref.entity_data === "object" ? ref.entity_data : {};
        const url = entityData.website_url || entityData.provider_url || ref.url || ref.link || null;
        entityReferences.push({
          token: ref.matched_text || null,
          name: ref.name || ref.alt || entityData.name || null,
          category: ref.category || null,
          location: entityData.location || ref.extra_params?.location || ref.extra_params?.disambiguation || null,
          address: entityData.address || ref.extra_params?.address || null,
          url: /^https?:\/\//i.test(String(url || "")) ? url : null,
          image_url: entityData.image_url || null,
          rating: entityData.rating || null,
          review_count: entityData.review_count || null,
          phone: entityData.phone || null
        });
      } else if (ref.type === "image_v2" || ref.type === "image" || ref.type === "images") {
        const images = Array.isArray(ref.images) ? ref.images.map(normalizeImageReferenceImage).filter(Boolean) : [];
        if (ref.matched_text || images.length) {
          imageReferences.push({
            token: ref.matched_text || null,
            queries: imageQueriesFromReference(ref),
            aspect_ratio: null,
            raw: { type: ref.type, refs: ref.refs || [], alt: ref.alt || null },
            kind: ref.type || "image_v2",
            images
          });
        }
      }
    }

    return { sourceReferences, entityReferences, fileReferences, imageReferences };
  }

  function isHttpUrl(value) {
    return /^https?:\/\//i.test(String(value || "").trim());
  }

  function isDirectImageLikeUrl(value) {
    const url = String(value || "").trim();
    if (!url) return false;
    if (/^data:image\//i.test(url)) return true;
    if (!isHttpUrl(url)) return false;
    if (/\.(png|jpe?g|gif|webp|avif|svg)([?#].*)?$/i.test(url)) return true;
    return /(oaiusercontent|oaidalle|dalle|imagegen|images\.openai|oaidalleapiprodscus|blob\.core\.windows\.net|th\.bing\.com|bing\.com\/th|encrypted-tbn|gstatic\.com\/images|googleusercontent|images\.unsplash\.com|images\.pexels\.com|upload\.wikimedia\.org|staticflickr|twimg\.com\/media|cdn.*\/(image|img|photo|thumb)|\/thumb\/)/i.test(url);
  }

  function isPreviewContextKey(contextKey = "") {
    return /(^|_|-|\.)(image|img|thumbnail|thumb|preview|watermarked|media|photo|picture|content_url|image_url|thumbnail_url|thumb_url|preview_url|src)(_|-|\.|$)/i.test(String(contextKey || ""));
  }

  function isLikelyImageUrl(value, contextKey = "") {
    const url = String(value || "").trim();
    if (!/^https?:\/\//i.test(url) && !/^data:image\//i.test(url)) return false;
    if (isDirectImageLikeUrl(url)) return true;
    if (!isPreviewContextKey(contextKey)) return false;
    if (/\.(html?|php|aspx?)([?#].*)?$/i.test(url)) return false;
    if (/(^|[?&])(q|query|search)=/i.test(url)) return false;
    if (/(\/maps\?|\/search\?|google\.[^/]+\/search|bing\.com\/search|tripadvisor|wikipedia\.org\/wiki\/)/i.test(url)) return false;
    return /(image|img|thumbnail|thumb|preview|media|photo|picture|cdn|static|assets|blob)/i.test(url);
  }

  function firstUsableSourceUrl(source = {}, previewUrl = "") {
    const candidates = [source.source_url, source.sourceUrl, source.page_url, source.pageUrl, source.url_page, source.host_page_url, source.url, source.href, source.link].filter(Boolean);
    for (const candidate of candidates) {
      const clean = String(candidate || "").trim();
      if (isHttpUrl(clean) && clean !== previewUrl) return clean;
    }
    return null;
  }

  function normalizeImageAsset(url, source = {}, contextKey = "") {
    const cleanUrl = String(url || "").trim();
    if (!cleanUrl) return null;
    return {
      url: cleanUrl,
      preview_url: cleanUrl,
      title: source.title || source.name || source.alt || source.caption || source.attribution || source.query || source.display_title || source.host_page_title || null,
      source_url: firstUsableSourceUrl(source, cleanUrl),
      query: source.query || null,
      context_key: contextKey || null,
      width: source.width || source.w || null,
      height: source.height || source.h || null
    };
  }

  function collectImageAssetsFromRaw(raw) {
    const assets = [];
    const seen = new Set();
    const visited = new WeakSet();
    const directPreviewKey = /(^|_|-|\.)(src|image|img|thumbnail|thumb|preview|watermarked|media|photo|picture|content_url|image_url|thumbnail_url|thumb_url|preview_url)(_|-|\.|$)/i;
    const sourceOnlyKey = /(^|_|-|\.)(url|href|link|source_url|sourceUrl|page_url|pageUrl|host_page_url)(_|-|\.|$)/i;

    function add(url, source, contextKey) {
      if (!isLikelyImageUrl(url, contextKey)) return;
      const asset = normalizeImageAsset(url, source || {}, contextKey);
      if (!asset) return;
      const urlKey = String(asset.url || "").split(/[?#]/)[0];
      if (urlKey && seen.has(urlKey)) return;
      if (urlKey) seen.add(urlKey);
      assets.push(asset);
    }

    function walk(value, contextKey = "", parent = null) {
      if (!value) return;
      if (typeof value === "string") {
        if (isLikelyImageUrl(value, contextKey)) add(value, parent || {}, contextKey);
        return;
      }
      if (Array.isArray(value)) {
        for (const child of value) walk(child, contextKey, parent);
        return;
      }
      if (typeof value !== "object") return;
      if (visited.has(value)) return;
      visited.add(value);

      const keys = Object.keys(value);
      const objectHasImageKey = keys.some(key => directPreviewKey.test(key));

      for (const [key, child] of Object.entries(value)) {
        if (typeof child !== "string") continue;
        if (directPreviewKey.test(key)) {
          add(child, value, key);
        } else if (objectHasImageKey && sourceOnlyKey.test(key) && isDirectImageLikeUrl(child)) {
          add(child, value, key);
        }
      }

      for (const [key, child] of Object.entries(value)) {
        walk(child, key, value);
      }
    }

    walk(raw, "raw", null);
    return assets;
  }

  function normalizeSearchText(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  const IMAGE_QUERY_STOP_WORDS = new Set([
    "summer", "france", "french", "gard", "ardeche", "aveyron", "village", "river", "riviere",
    "beach", "plage", "photo", "image", "images", "view", "views", "tourism", "tourist",
    "point", "interest", "place", "city", "around", "near", "swimming", "camping", "water", "valley"
  ]);

  function informativeImageWords(value) {
    return normalizeSearchText(value)
      .split(/[^a-z0-9]+/i)
      .map(word => word.trim())
      .filter(word => word.length >= 4 && !IMAGE_QUERY_STOP_WORDS.has(word));
  }

  function scoreImageAssetForGroup(asset, group) {
    const haystack = normalizeSearchText([asset.title, asset.query, asset.source_url, asset.url].filter(Boolean).join(" "));
    const queries = Array.isArray(group?.queries) ? group.queries : [];
    let score = 0;

    for (const query of queries) {
      const normalizedQuery = normalizeSearchText(query);
      const words = informativeImageWords(query);
      let matchedWords = 0;

      for (const word of words) {
        if (haystack.includes(word)) {
          matchedWords += 1;
          score += 2;
        }
      }

      // Une correspondance exacte est forte, mais seulement si la requête a encore
      // des termes discriminants après suppression des mots trop génériques.
      if (words.length >= 2 && normalizedQuery && haystack.includes(normalizedQuery)) score += 10;
      if (matchedWords >= 2) score += 5;
    }

    return score;
  }


  function hydrateImageGroups(messages, raw) {
    const assets = collectImageAssetsFromRaw(raw);

    function compactDuplicateImages(list) {
      const seenUrl = new Set();
      const seenTitle = new Set();
      const result = [];
      for (const asset of list) {
        const urlKey = String(asset.preview_url || asset.url || "").split(/[?#]/)[0];
        const titleKey = normalizeSearchText(asset.title || "");
        const sourceKey = String(asset.source_url || "").split(/[?#]/)[0];
        if (urlKey && seenUrl.has(urlKey)) continue;
        if (sourceKey && seenUrl.has(sourceKey)) continue;
        if (titleKey && seenTitle.has(titleKey)) continue;
        if (urlKey) seenUrl.add(urlKey);
        if (sourceKey) seenUrl.add(sourceKey);
        if (titleKey) seenTitle.add(titleKey);
        result.push(asset);
      }
      return result;
    }

    for (const msg of messages) {
      if (!Array.isArray(msg.image_groups) || !msg.image_groups.length) continue;
      for (const group of msg.image_groups) {
        const wanted = 6;
        const scored = assets
          .map((asset, order) => ({ asset, order, score: scoreImageAssetForGroup(asset, group) }))
          .filter(item => item.score > 0)
          .sort((a, b) => (b.score - a.score) || (a.order - b.order));

        let selected = compactDuplicateImages(scored.map(item => item.asset)).slice(0, wanted);

        if (selected.length < wanted && scored.length) {
          const selectedUrls = new Set(selected.map(asset => String(asset.preview_url || asset.url || "").split(/[?#]/)[0]));
          const selectedTitles = new Set(selected.map(asset => normalizeSearchText(asset.title || "")).filter(Boolean));
          for (const item of scored) {
            if (selected.length >= wanted) break;
            const urlKey = String(item.asset.preview_url || item.asset.url || "").split(/[?#]/)[0];
            const titleKey = normalizeSearchText(item.asset.title || "");
            if (urlKey && selectedUrls.has(urlKey)) continue;
            if (titleKey && selectedTitles.has(titleKey)) continue;
            selected.push(item.asset);
            if (urlKey) selectedUrls.add(urlKey);
            if (titleKey) selectedTitles.add(titleKey);
          }
        }

        if (selected.length) group.images = selected;
      }
    }
  }


  function buildActivePath(data) {
    const mapping = data.mapping || {};
    const path = [];
    let nodeId = data.current_node;
    const guard = new Set();

    while (nodeId && mapping[nodeId] && !guard.has(nodeId)) {
      guard.add(nodeId);
      const node = mapping[nodeId];
      if (node.message) {
        path.push({ node_id: nodeId, node, message: node.message });
      }
      nodeId = node.parent;
    }

    path.reverse();

    if (path.length > 0) return path;

    return Object.entries(mapping)
      .map(([node_id, node]) => ({ node_id, node, message: node.message }))
      .filter(item => item.message)
      .sort((a, b) => (a.message.create_time || 0) - (b.message.create_time || 0));
  }

  function parseWholeJsonContent(content) {
    const trimmed = (content || "").trim();
    if (!trimmed || !trimmed.startsWith("{")) return null;
    try {
      const parsed = JSON.parse(trimmed);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function isInternalMessage(msg, content) {
    const metadata = msg?.metadata || {};
    const role = msg?.author?.role;
    const trimmed = (content || "").trim();

    if (!trimmed) return { internal: false, reason: "empty_content" };

    if (role === "assistant") {
      const parsed = parseWholeJsonContent(trimmed);
      const contentType = parsed?.content_type || null;

      const internalContentTypes = new Set([
        "model_editable_context",
        "reasoning_recap",
        "thoughts",
        "code",
        "multi_tool_use.parallel",
        "tool_result",
        "tool_use"
      ]);

      if (contentType && internalContentTypes.has(contentType)) {
        return { internal: true, reason: contentType };
      }

      if (contentType && metadata.message_type === "next") {
        return { internal: true, reason: "internal_json_message" };
      }
    }

    if (metadata.is_thinking_preamble_message === true) {
      return { internal: true, reason: "thinking_preamble" };
    }

    if (metadata.reasoning_status === "is_reasoning" || metadata.reasoning_status === "reasoning_ended") {
      return { internal: true, reason: "reasoning_metadata" };
    }

    if (metadata.disable_turn_actions === true && metadata.hide_inline_actions === true) {
      return { internal: true, reason: "hidden_intermediate_assistant_message" };
    }

    if (role === "assistant" && metadata.message_type === "next" && metadata.chime_version && trimmed.startsWith("{")) {
      return { internal: true, reason: "internal_json_message" };
    }

    return { internal: false, reason: null };
  }

  function mergeImageReferenceGroups(contentGroups, referenceGroups) {
    const groups = Array.isArray(contentGroups) ? contentGroups.map(group => ({ ...group })) : [];
    const refs = Array.isArray(referenceGroups) ? referenceGroups : [];
    const used = new Set();

    for (const group of groups) {
      if (!group?.token) continue;
      const matchIndex = refs.findIndex((ref, index) => !used.has(index) && ref?.token === group.token);
      if (matchIndex >= 0) {
        const ref = refs[matchIndex];
        used.add(matchIndex);
        group.queries = Array.isArray(group.queries) && group.queries.length ? group.queries : (ref.queries || []);
        group.images = Array.isArray(group.images) && group.images.length ? group.images : (ref.images || []);
        group.raw = group.raw || ref.raw || null;
        group.kind = group.kind || ref.kind || null;
      }
    }

    for (let index = 0; index < refs.length; index += 1) {
      if (used.has(index)) continue;
      const ref = refs[index];
      if (ref && (ref.token || (Array.isArray(ref.images) && ref.images.length))) groups.push({ ...ref });
    }

    return groups;
  }

  function makeMessage(item, exportedAt, index, includeMetadata) {
    const msg = item.message;
    const role = msg?.author?.role;
    const content = extractTextFromContent(msg.content).trim();
    const createdAt = msg.create_time ? formatDate(new Date(msg.create_time * 1000)) : null;
    const updatedAt = msg.update_time ? formatDate(new Date(msg.update_time * 1000)) : null;
    const attachments = extractAttachments(msg);
    const readableRefs = extractReadableReferences(msg.metadata || {});
    const imageGroups = mergeImageReferenceGroups(extractImageGroupsFromContent(content), readableRefs.imageReferences || []);

    const finalMessage = {
      index,
      role,
      speaker: speakerFromRole(role),
      timestamp_message: createdAt,
      timestamp_update: updatedAt,
      message_id: msg.id || null,
      node_id: item.node_id || null,
      content,
      extraction_method: "backend_api_page_context_with_session_token"
    };

    if (attachments.length > 0) finalMessage.attachments = attachments;
    if (imageGroups.length > 0) finalMessage.image_groups = imageGroups;
    if (readableRefs.sourceReferences.length > 0) finalMessage.source_references = readableRefs.sourceReferences;
    if (readableRefs.entityReferences.length > 0) finalMessage.entity_references = readableRefs.entityReferences;
    if (readableRefs.fileReferences.length > 0) finalMessage.file_references = readableRefs.fileReferences;
    if (includeMetadata && msg.metadata && Object.keys(msg.metadata).length > 0) finalMessage.metadata = msg.metadata;

    return finalMessage;
  }

  function buildMessages(raw, exportedAt, options = {}) {
    const includeInternal = options.includeInternal === true;
    const includeMetadata = options.includeMetadata === true;
    const rawItems = buildActivePath(raw);
    const messages = [];
    const excluded = [];
    const skippedEmpty = [];
    const roleIgnored = [];

    for (const item of rawItems) {
      const msg = item.message;
      const role = msg?.author?.role;
      if (role !== "user" && role !== "assistant") {
        roleIgnored.push({
          role: role || null,
          message_id: msg?.id || null,
          node_id: item.node_id || null
        });
        continue;
      }

      const content = extractTextFromContent(msg.content).trim();
      if (!content) {
        skippedEmpty.push({
          role,
          message_id: msg.id || null,
          node_id: item.node_id || null,
          reason: "empty_content"
        });
        continue;
      }

      const internalState = isInternalMessage(msg, content);

      if (internalState.internal && !includeInternal) {
        excluded.push({
          role,
          message_id: msg.id || null,
          node_id: item.node_id || null,
          reason: internalState.reason,
          preview: content.slice(0, 160)
        });
        continue;
      }

      messages.push(makeMessage(item, exportedAt, messages.length + 1, includeMetadata));
    }

    return { rawItems, messages, excluded, skippedEmpty, roleIgnored };
  }

  function summarizeSession(session) {
    return {
      ok: !!session,
      keys: session && typeof session === "object" ? Object.keys(session) : [],
      access_token_present: !!(session && (session.accessToken || session.access_token)),
      user_present: !!session?.user,
      expires_present: !!session?.expires
    };
  }

  async function getSessionToken(steps) {
    const sessionUrl = `${location.origin}/api/auth/session`;
    steps.push({ ok: true, label: "session_url", value: sessionUrl });

    const response = await fetch(sessionUrl, {
      method: "GET",
      credentials: "include",
      headers: { "accept": "application/json" }
    });

    const contentType = response.headers.get("content-type") || "";
    steps.push({
      ok: response.ok,
      label: "fetch_session",
      status: response.status,
      statusText: response.statusText,
      contentType
    });

    if (!response.ok) return { token: null, sessionSummary: null, sessionError: await response.text().catch(() => "") };

    const session = await response.json().catch(() => null);
    const sessionSummary = summarizeSession(session);
    steps.push({ ok: !!sessionSummary.access_token_present, label: "session_summary", value: sessionSummary });

    const accessToken = session?.accessToken || session?.access_token || null;
    return { token: accessToken, sessionSummary, sessionError: null };
  }

  async function fetchConversation(apiUrl, accessToken, steps) {
    const attempts = [];

    attempts.push({
      label: "fetch_backend_api_no_authorization",
      headers: { "accept": "application/json" }
    });

    if (accessToken) {
      attempts.push({
        label: "fetch_backend_api_bearer_token",
        headers: {
          "accept": "application/json",
          "authorization": `Bearer ${accessToken}`
        }
      });
    }

    let lastFailure = null;

    for (const attempt of attempts) {
      const response = await fetch(apiUrl, {
        method: "GET",
        credentials: "include",
        headers: attempt.headers
      });

      const contentType = response.headers.get("content-type") || "";
      const step = {
        ok: response.ok,
        label: attempt.label,
        status: response.status,
        statusText: response.statusText,
        contentType
      };
      steps.push(step);

      if (response.ok) {
        const raw = await response.json();
        return { raw, usedAttempt: attempt.label, status: response.status };
      }

      const errorText = await response.text().catch(() => "");
      lastFailure = { attempt: attempt.label, status: response.status, statusText: response.statusText, contentType, errorText };
    }

    return { raw: null, usedAttempt: null, status: lastFailure?.status || null, failure: lastFailure };
  }

  function summarizeExcluded(excluded) {
    return excluded.reduce((acc, item) => {
      acc[item.reason] = (acc[item.reason] || 0) + 1;
      return acc;
    }, {});
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeJsString(value) {
    return JSON.stringify(String(value ?? ""));
  }

  function safeDomId(value) {
    return String(value ?? "id")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "id";
  }

  function renderCopyButton(targetId, label, extraClass) {
    return `<button class="copy-button ${escapeHtml(extraClass || "")}" type="button" data-copy-target="${escapeHtml(targetId)}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="2"></rect><path d="M5 15V7a2 2 0 0 1 2-2h8"></path></svg></button>`;
  }

  function sanitizeFilenamePart(value) {
    return String(value || "conversation")
      .normalize("NFKD")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "conversation";
  }

  function assetCandidateUrls(att) {
    const raw = att && att.raw && typeof att.raw === "object" ? att.raw : {};
    const metadata = raw && raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {};
    return [
      att && att.url,
      att && att.download_url,
      att && att.downloadUrl,
      att && att.preview_url,
      att && att.thumbnail_url,
      raw.url,
      raw.download_url,
      raw.downloadUrl,
      raw.preview_url,
      raw.thumbnail_url,
      raw.asset_pointer_link,
      raw.watermarked_asset_pointer,
      metadata.asset_pointer_link,
      metadata.watermarked_asset_pointer
    ];
  }

  function attachmentDownloadUrl(att) {
    for (const candidate of assetCandidateUrls(att)) {
      const value = String(candidate || "").trim();
      if (/^https?:\/\//i.test(value)) return value;
    }
    return null;
  }

  function extractFileId(value) {
    const match = String(value || "").match(/file_[a-zA-Z0-9]+/);
    return match ? match[0] : null;
  }

  function attachmentFileId(att) {
    const raw = att && att.raw && typeof att.raw === "object" ? att.raw : {};
    const candidates = [
      att?.id, att?.file_id, att?.asset_pointer, att?.url,
      raw.id, raw.file_id, raw.asset_pointer, raw.assetPointer, raw.url, raw.preview_url, raw.thumbnail_url, raw.name
    ];
    for (const candidate of candidates) {
      const fileId = extractFileId(candidate);
      if (fileId) return fileId;
    }
    return null;
  }

  function imagePreviewUrl(att) {
    const rawItems = Array.isArray(att?.raw_items) ? att.raw_items : [att?.raw].filter(Boolean);
    const candidates = [
      att?.preview_url, att?.thumbnail_url, att?.url,
      ...assetCandidateUrls(att),
      ...rawItems.flatMap(raw => assetCandidateUrls({ raw }))
    ];
    for (const candidate of candidates) {
      const value = String(candidate || "").trim();
      if (/^data:image\//i.test(value) || isDirectImageLikeUrl(value)) return value;
    }
    return null;
  }

  function isImageAttachment(att) {
    const raw = att && att.raw && typeof att.raw === "object" ? att.raw : {};
    const type = String(att?.type || raw.mime_type || raw.content_type || "").toLowerCase();
    const name = String(att?.name || raw.name || raw.filename || "").toLowerCase();
    return type.startsWith("image/") || type === "image_asset_pointer" || name.match(/\.(png|jpe?g|gif|webp|avif|svg)$/);
  }

  function imageDimensions(att) {
    const rawItems = Array.isArray(att?.raw_items) ? att.raw_items : [att?.raw].filter(Boolean);
    for (const raw of [{ width: att?.width, height: att?.height }, ...rawItems]) {
      const width = raw?.width || raw?.w || null;
      const height = raw?.height || raw?.h || null;
      if (width && height) return `${width} × ${height}`;
    }
    return "";
  }

  function imageLabel(att) {
    const fileId = attachmentFileId(att);
    const pointer = att?.pointer || (String(att?.id || "").startsWith("sediment://") ? att.id : null);
    const main = [att?.name, imageDimensions(att)].filter(Boolean).join(" — ") || att?.name || fileId || "image";
    const technical = [fileId, pointer].filter(Boolean).join(" — ");
    return technical ? `${main} — ${technical}` : main;
  }

  function mergeImageAttachments(attachments) {
    const images = Array.isArray(attachments) ? attachments.filter(isImageAttachment) : [];
    const byKey = new Map();
    const order = [];

    for (const att of images) {
      const fileId = attachmentFileId(att);
      const fallbackKey = JSON.stringify([att?.name || "", att?.type || "", imageDimensions(att) || "", att?.id || ""]);
      const key = fileId || fallbackKey;
      if (!byKey.has(key)) {
        byKey.set(key, {
          name: null,
          type: null,
          id: fileId || att?.id || null,
          pointer: null,
          raw_items: [],
          raw: att?.raw || {},
          url: att?.url || null,
          preview_url: att?.preview_url || null,
          thumbnail_url: att?.thumbnail_url || null
        });
        order.push(key);
      }

      const merged = byKey.get(key);
      const raw = att?.raw && typeof att.raw === "object" ? att.raw : {};
      const type = String(att?.type || raw.mime_type || raw.content_type || "").toLowerCase();
      const name = att?.name || raw.name || raw.filename || raw.title || null;
      const id = att?.id || raw.file_id || raw.asset_pointer || null;

      if (name && name !== "image_asset_pointer" && !merged.name) merged.name = name;
      if (type && type !== "image_asset_pointer" && !merged.type) merged.type = type;
      if (!merged.id && id) merged.id = fileId || id;
      if (String(id || "").startsWith("sediment://")) merged.pointer = id;
      if (!merged.pointer && String(raw.asset_pointer || "").startsWith("sediment://")) merged.pointer = raw.asset_pointer;
      if (!merged.url && att?.url) merged.url = att.url;
      if (!merged.preview_url && att?.preview_url) merged.preview_url = att.preview_url;
      if (!merged.thumbnail_url && att?.thumbnail_url) merged.thumbnail_url = att.thumbnail_url;
      if (att?.raw) merged.raw_items.push(att.raw);
    }

    return order.map(key => {
      const item = byKey.get(key);
      if (!item.name) item.name = "image";
      if (!item.type) item.type = "image";
      if (item.raw_items.length) item.raw = item.raw_items[0];
      return item;
    });
  }

  function renderImagePreviews(attachments) {
    const images = mergeImageAttachments(attachments);
    if (!images.length) return "";

    const items = images.map(att => {
      const label = imageLabel(att);
      const url = imagePreviewUrl(att);
      if (!url) {
        return `<li class="image-preview image-preview-unavailable"><code>${escapeHtml(label)}</code><span>${escapeHtml(t("imagePreviewUnavailable"))}</span></li>`;
      }
      const safe = escapeHtml(safeImageUrl(url));
      return `<li class="image-preview"><figure><a href="${safe}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(t("openImage"))}"><img src="${safe}" alt="${escapeHtml(label)}" loading="lazy" onerror="this.closest('li').classList.add('image-load-error')"></a><figcaption>${escapeHtml(label)}</figcaption><span class="image-error-text">${escapeHtml(t("imagePreviewUnavailable"))}</span></figure></li>`;
    }).join("");

    return `<details class="media-previews" open><summary>${escapeHtml(t("imagesLabel"))} <span>(${escapeHtml(images.length)})</span></summary><ul>${items}</ul></details>`;
  }

  function compactReadableAttachments(attachments) {
    if (!Array.isArray(attachments)) return [];
    const result = [];
    const seenImageFileIds = new Set();

    for (const att of attachments) {
      if (isImageAttachment(att)) {
        const fileId = attachmentFileId(att);
        if (fileId) {
          if (seenImageFileIds.has(fileId)) continue;
          seenImageFileIds.add(fileId);
        }
      }
      result.push(att);
    }

    return result;
  }

  function renderAttachment(att) {
    const label = [att.name, att.type, att.id].filter(Boolean).join(" — ");
    const url = settings.htmlAttachmentLinks === "available" ? attachmentDownloadUrl(att) : null;
    const link = url ? ` <a class="attachment-download" href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("downloadAttachment"))}</a>` : "";
    return `<li><code>${escapeHtml(label || JSON.stringify(att))}</code>${link}</li>`;
  }

  function renderAttachments(attachments, l, compactReadable = false) {
    const list = compactReadable ? compactReadableAttachments(attachments) : attachments;
    if (!Array.isArray(list) || !list.length) return "";
    const label = t("attachments");
    return `<details class="attachments"><summary>${escapeHtml(label)} <span>(${escapeHtml(list.length)})</span></summary><ul>${list.map(renderAttachment).join("")}</ul></details>`;
  }

  function imageGroupRenderableUrl(image) {
    const candidates = [
      image?.preview_url, image?.thumbnail_url, image?.content_url, image?.image_url, image?.url
    ];
    for (const candidate of candidates) {
      const value = String(candidate || "").trim();
      if (/^data:image\//i.test(value) || isDirectImageLikeUrl(value)) return value;
    }
    return null;
  }

  function compactImageGroupImages(images) {
    const result = [];
    const seenUrl = new Set();
    const seenSource = new Set();
    const seenTitle = new Set();
    for (const image of Array.isArray(images) ? images : []) {
      const preview = imageGroupRenderableUrl(image);
      const source = String(image?.source_url || "").split(/[?#]/)[0];
      const title = normalizeSearchText(image?.title || "");
      const urlKey = preview ? String(preview).split(/[?#]/)[0] : "";
      if (urlKey && seenUrl.has(urlKey)) continue;
      if (!urlKey && source && seenSource.has(source)) continue;
      if (!urlKey && !source && title && seenTitle.has(title)) continue;
      if (urlKey) seenUrl.add(urlKey);
      if (source) seenSource.add(source);
      if (title) seenTitle.add(title);
      result.push({ ...image, _renderable_url: preview });
    }
    return result;
  }

  function imageSourceNameFromUrl(value) {
    const raw = String(value || "").trim();
    if (!raw || !isHttpUrl(raw)) return null;
    try {
      const host = new URL(raw).hostname.replace(/^www\./i, "").toLowerCase();
      const known = [
        [/tourismegard\.com$/, "Gard Tourisme"],
        [/tourisme-occitanie\.com$/, "Tourisme Occitanie"],
        [/tourisme-aveyron\.com$/, "Tourisme Aveyron"],
        [/guide-tarn-aveyron\.com$/, "Guide Tarn Aveyron"],
        [/village-montclus\.fr$/, lang() === "fr" ? "Commune de Montclus" : "Montclus municipality"],
        [/gettyimages\.com$/, "Getty Images"],
        [/novasol/i, "Novasol"],
        [/borabeach\.fr$/, "Borabeach"],
        [/yellohvillage/i, "Yelloh Village"],
        [/campinglaplage-gard\.fr$/, "Camping La Plage Gard"],
        [/provenceoccitane\.com$/, "Provence Occitane"],
        [/beachsearcher\.fr$/, "BeachSearcher"],
        [/images\.openai\.com$/, "OpenAI Images"]
      ];
      for (const [pattern, label] of known) {
        if (pattern.test(host)) return label;
      }
      return host
        .split(".")
        .filter(part => part && !["com", "fr", "org", "net", "co", "uk", "nl"].includes(part))
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ") || host;
    } catch (_) {
      return null;
    }
  }

  function imageSourceName(image = {}) {
    const explicit = image.attribution || image.source_name || image.site_name || image.provider || null;
    if (explicit) return String(explicit).trim();
    return imageSourceNameFromUrl(image.source_url) || imageSourceNameFromUrl(image.url) || imageSourceNameFromUrl(image.preview_url) || null;
  }

  function dedupeShortLabels(values, max = 8) {
    const seen = new Set();
    const result = [];
    for (const value of values) {
      const label = String(value || "").trim();
      if (!label) continue;
      const key = normalizeSearchText(label);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(label);
      if (result.length >= max) break;
    }
    return result;
  }

  function deriveGalleryLocation(group = {}, images = []) {
    const queries = Array.isArray(group?.queries) ? group.queries : [];
    const candidates = [];
    const cleanup = value => String(value || "")
      .replace(/(summer|village|river|rivi[eè]re|beach|plage|stone|houses|house|swimming|waterfalls?|cascade|cascades|viewpoint|views?|abbey|church|camping|photos?)/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (queries.length) candidates.push(cleanup(queries[0]));
    for (const image of images) {
      const title = cleanup(image.title || "");
      if (title && title.length <= 70) candidates.push(title);
    }

    const cleaned = dedupeShortLabels(candidates, 1)[0] || null;
    if (!cleaned) return null;
    const normalized = cleaned.replace(/\s+(Gard|Aveyron|Ard[eè]che|France)$/i, ", $1");
    return normalized.length >= 3 ? normalized : null;
  }

  function deriveGalleryContent(group = {}, images = []) {
    const text = normalizeSearchText([
      ...(Array.isArray(group?.queries) ? group.queries : []),
      ...images.map(image => image.title || "")
    ].join(" "));
    const french = lang() === "fr";
    const concepts = [];
    const add = (needle, fr, en) => { if (needle.test(text)) concepts.push(french ? fr : en); };

    add(/(village|medieval|medievale|médiéval|stone|maison|houses|ruelles?)/, "village médiéval", "medieval village");
    add(/(river|riviere|ceze|lot|truyere|plage|beach|swimming|baignade)/, "rivière / plage naturelle", "river / natural beach");
    add(/(cascade|cascades|waterfalls?)/, "cascades", "waterfalls");
    add(/(abbey|abbaye|church|eglise|église)/, "abbaye / patrimoine", "abbey / heritage");
    add(/(valley|vallee|vallée|viewpoint|panorama|gorges?)/, "vallée / point de vue", "valley / viewpoint");
    add(/(camping|location|vacances|mobil)/, "hébergement / camping", "lodging / camping");

    return dedupeShortLabels(concepts, 4).join(", ") || null;
  }

  function renderImageGalleryInfo(group, images) {
    if (!images.length) return "";
    const location = deriveGalleryLocation(group, images);
    const content = deriveGalleryContent(group, images);
    const sources = dedupeShortLabels(images.map(imageSourceName), 8);
    const rows = [];
    if (location) rows.push(`<div><span>${escapeHtml(t("galleryLocationLabel"))}</span><strong>${escapeHtml(location)}</strong></div>`);
    if (content) rows.push(`<div><span>${escapeHtml(t("galleryContentLabel"))}</span><strong>${escapeHtml(content)}</strong></div>`);
    rows.push(`<div><span>${escapeHtml(t("galleryImagesLabel"))}</span><strong>${escapeHtml(images.length)} ${escapeHtml(t("galleryImagesDisplayed"))}</strong></div>`);
    if (sources.length) rows.push(`<div><span>${escapeHtml(t("gallerySourcesLabel"))}</span><strong>${escapeHtml(sources.join(", "))}</strong></div>`);
    return `<div class="image-gallery-info"><strong>${escapeHtml(t("galleryAboutLabel"))}</strong><div>${rows.join("")}</div></div>`;
  }

  function renderImageGroup(group, groupId) {
    const queries = Array.isArray(group?.queries) ? group.queries : [];
    const images = compactImageGroupImages(group?.images);
    const imageItems = images.map((image, index) => {
      const preview = image._renderable_url;
      const label = image.title || queries[index] || `${t("imagesLabel")} ${index + 1}`;
      const target = image.source_url && isHttpUrl(image.source_url) ? safeUrl(image.source_url) : preview;
      if (!preview) {
        const link = target ? `<a href="${escapeHtml(target)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>` : escapeHtml(label);
        return `<li class="image-preview image-preview-unavailable"><code>${link}</code><span>${escapeHtml(t("imageGroupPreviewUnavailable"))}</span></li>`;
      }
      const safePreview = escapeHtml(safeImageUrl(preview));
      const safeTarget = escapeHtml(target || preview);
      return `<li class="image-preview"><figure><a href="${safeTarget}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(t("openImage"))}"><img src="${safePreview}" alt="${escapeHtml(label)}" loading="lazy" onerror="this.closest('li').classList.add('image-load-error')"></a><figcaption>${escapeHtml(label)}</figcaption><span class="image-error-text">${escapeHtml(t("imageGroupPreviewUnavailable"))}</span></figure></li>`;
    }).join("");

    const unavailable = images.length ? "" : `<div class="image-group-unavailable">${escapeHtml(t("imageGroupPreviewUnavailable"))}</div>`;
    const gallery = images.length ? `<ul class="image-gallery">${imageItems}</ul>` : "";
    const infoBlock = renderImageGalleryInfo(group, images);

    return `<details class="media-previews image-group" open id="${escapeHtml(groupId)}"><summary>${escapeHtml(t("imageGroupLabel"))} <span>(${escapeHtml(images.length || 1)})</span></summary>${gallery}${unavailable}${infoBlock}</details>`;
  }

  function renderMarkdownWithImageGroups(text, baseId, state) {
    const source = String(text || "");
    const pattern = /(image_group|i)([\s\S]*?)/g;
    let lastIndex = 0;
    let match;
    const out = [];

    while ((match = pattern.exec(source)) !== null) {
      const before = source.slice(lastIndex, match.index);
      if (before.trim()) out.push(renderMarkdownSegment(before));

      const kind = match[1];
      const fallbackGroup = kind === "image_group"
        ? (parseImageGroupPayload(match[2]) || { queries: [], images: [] })
        : { queries: [], images: [], raw: match[2], kind: "image_v2", token: match[0] };
      const group = state.imageGroups[state.imageGroupIndex] || fallbackGroup;
      const groupId = `${safeDomId(baseId)}-image-group-${state.imageGroupIndex + 1}`;
      out.push(renderImageGroup(group, groupId));
      state.imageGroupIndex += 1;
      lastIndex = pattern.lastIndex;
    }

    const rest = source.slice(lastIndex);
    if (rest.trim()) out.push(renderMarkdownSegment(rest));
    return out.join("\n");
  }


  function renderMetadata(metadata) {
    if (!metadata) return "";
    return `<details class="metadata"><summary>${escapeHtml(t("metadataLabel"))}</summary><pre>${escapeHtml(JSON.stringify(metadata, null, 2))}</pre></details>`;
  }

  function appendHighlightedSegment(out, source, start, end) {
    if (end > start) out.push(escapeHtml(source.slice(start, end)));
  }

  function highlightJsonCode(code) {
    const source = String(code || "");
    const pattern = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}\[\],:])/g;
    let last = 0;
    let match;
    const out = [];
    while ((match = pattern.exec(source)) !== null) {
      appendHighlightedSegment(out, source, last, match.index);
      if (match[1]) {
        out.push(`<span class="${match[2] ? "tok-attr" : "tok-string"}">${escapeHtml(match[1])}</span>`);
        if (match[2]) out.push(`<span class="tok-punct">${escapeHtml(match[2])}</span>`);
      } else if (match[3]) out.push(`<span class="tok-number">${escapeHtml(match[3])}</span>`);
      else if (match[4]) out.push(`<span class="tok-keyword">${escapeHtml(match[4])}</span>`);
      else out.push(`<span class="tok-punct">${escapeHtml(match[5])}</span>`);
      last = pattern.lastIndex;
    }
    appendHighlightedSegment(out, source, last, source.length);
    return out.join("");
  }

  function highlightXmlTag(tag) {
    if (/^<!--/.test(tag) || /^<!\[CDATA\[/.test(tag)) return `<span class="tok-comment">${escapeHtml(tag)}</span>`;
    let html = escapeHtml(tag);
    html = html.replace(/(&lt;\/?)([A-Za-z_][\w:.-]*)/g, '$1<span class="tok-tag">$2</span>');
    html = html.replace(/(\s)([A-Za-z_:][\w:.-]*)(=)/g, '$1<span class="tok-attr">$2</span>$3');
    html = html.replace(/(=)(&quot;[\s\S]*?&quot;|&#039;[\s\S]*?&#039;|[^\s&]+)(?=\s|\/?&gt;)/g, '$1<span class="tok-string">$2</span>');
    html = html.replace(/(&lt;\/?|\/?&gt;)/g, '<span class="tok-punct">$1</span>');
    return html;
  }

  function highlightXmlCode(code) {
    const source = String(code || "");
    const pattern = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\/?[A-Za-z_][\w:.-]*(?:\s+[^<>]*?)?\/?>)/g;
    let last = 0;
    let match;
    const out = [];
    while ((match = pattern.exec(source)) !== null) {
      appendHighlightedSegment(out, source, last, match.index);
      out.push(highlightXmlTag(match[0]));
      last = pattern.lastIndex;
    }
    appendHighlightedSegment(out, source, last, source.length);
    return out.join("");
  }

  function highlightGenericCode(code, language) {
    const source = String(code || "");
    const lang = String(language || "").toLowerCase();
    const keywords = lang === "python" || lang === "py"
      ? "and|as|assert|break|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield"
      : "async|await|break|case|catch|class|const|continue|default|delete|do|else|export|extends|false|finally|for|from|function|if|import|in|instanceof|let|new|null|return|switch|this|throw|true|try|typeof|undefined|var|void|while|yield";
    const pattern = new RegExp(`(//[^\\n]*|/\\*[\\s\\S]*?\\*/|#[^\\n]*)|("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\\x60(?:\\\\.|[^\\x60\\\\])*\\x60)|(\\b(?:${keywords})\\b)|(-?\\b\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?\\b)|([+\\-*\\/%=<>!&|?:;.,()[\\]{}]+)`, "gi");
    let last = 0;
    let match;
    const out = [];
    while ((match = pattern.exec(source)) !== null) {
      appendHighlightedSegment(out, source, last, match.index);
      if (match[1]) out.push(`<span class="tok-comment">${escapeHtml(match[1])}</span>`);
      else if (match[2]) out.push(`<span class="tok-string">${escapeHtml(match[2])}</span>`);
      else if (match[3]) out.push(`<span class="tok-keyword">${escapeHtml(match[3])}</span>`);
      else if (match[4]) out.push(`<span class="tok-number">${escapeHtml(match[4])}</span>`);
      else out.push(`<span class="tok-operator">${escapeHtml(match[5])}</span>`);
      last = pattern.lastIndex;
    }
    appendHighlightedSegment(out, source, last, source.length);
    return out.join("");
  }

  function highlightBatCode(code) {
    const source = String(code || "");
    const pattern = /(rem\b[^\n]*|::[^\n]*|@[a-z]+\b|\b(?:echo|set|if|else|for|in|do|call|start|exit|goto|pause)\b)|(%[^%\n]+%|![^!\n]+!)|("(?:\\.|[^"\\])*")/gi;
    let last = 0;
    let match;
    const out = [];
    while ((match = pattern.exec(source)) !== null) {
      appendHighlightedSegment(out, source, last, match.index);
      if (match[1]) out.push(`<span class="tok-keyword">${escapeHtml(match[1])}</span>`);
      else if (match[2]) out.push(`<span class="tok-variable">${escapeHtml(match[2])}</span>`);
      else out.push(`<span class="tok-string">${escapeHtml(match[3])}</span>`);
      last = pattern.lastIndex;
    }
    appendHighlightedSegment(out, source, last, source.length);
    return out.join("");
  }

  function highlightCode(code, language) {
    const lang = String(language || "text").trim().toLowerCase();
    const trimmed = String(code || "").trim();
    if (["json", "jsonc", "mcmeta"].includes(lang)) return highlightJsonCode(code);
    if (["xml", "html", "xhtml", "svg"].includes(lang)) return highlightXmlCode(code);
    if (["js", "javascript", "ts", "typescript", "css", "py", "python", "c", "cpp", "c++", "java", "php"].includes(lang)) return highlightGenericCode(code, lang);
    if (["bat", "cmd", "batch"].includes(lang)) return highlightBatCode(code);
    if (["", "text", "txt"].includes(lang)) {
      if (/^<\/?[A-Za-z_][\w:.-]*(?:\s|>|\/)/.test(trimmed)) return highlightXmlCode(code);
      if (/^[{[]/.test(trimmed)) return highlightJsonCode(code);
      if (/^(?:@?echo|set|start|call|rem|::|DayZServer_x64\.exe|-mod=)/i.test(trimmed)) return highlightBatCode(code);
    }
    return escapeHtml(String(code || ""));
  }

  function luminanceFromRgb(text) {
    const match = String(text || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) return null;
    const r = Number(match[1]) / 255;
    const g = Number(match[2]) / 255;
    const b = Number(match[3]) / 255;
    const conv = v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * conv(r) + 0.7152 * conv(g) + 0.0722 * conv(b);
  }

  function detectPageTheme() {
    const html = document.documentElement;
    if (html.classList.contains("dark") || html.getAttribute("data-theme") === "dark") return "dark";
    if (html.classList.contains("light") || html.getAttribute("data-theme") === "light") return "light";
    for (const el of [document.body, document.querySelector("main"), html].filter(Boolean)) {
      const lum = luminanceFromRgb(getComputedStyle(el).backgroundColor);
      if (lum !== null) return lum < 0.45 ? "dark" : "light";
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function safeUrl(url) {
    const value = String(url || "").trim();
    if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
    return "#";
  }

  function safeImageUrl(url) {
    const value = String(url || "").trim();
    if (/^https?:\/\//i.test(value) || /^data:image\//i.test(value)) return value;
    return "#";
  }

  function holdHtml(placeholders, html) {
    const token = `\uE000${placeholders.length}\uE001`;
    placeholders.push(html);
    return token;
  }

  function restoreHtmlPlaceholders(html, placeholders) {
    let out = html;
    placeholders.forEach((value, index) => {
      out = out.replaceAll(`\uE000${index}\uE001`, value);
    });
    return out;
  }

  function decodeMinimalHtmlEntities(value) {
    return String(value || "")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  function stripLeakedPrivatePlaceholders(value) {
    // Ne pas supprimer les marqueurs internes ChatGPT du type entity....
    // On ne nettoie ici que nos propres placeholders HTML internes : \uE000 + nombre + \uE001.
    return String(value || "").replace(/\uE000\d+\uE001/g, "");
  }

  function parseSpecialJsonPayload(payload) {
    const raw = decodeMinimalHtmlEntities(String(payload || "").trim());
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
  }

  let activeSourceReferences = [];
  let activeEntityReferences = [];
  let activeFileReferences = [];
  let activeSourceBaseId = "message";
  let activeSourceCounter = 0;

  function findEntityReference(payload) {
    const token = `entity${String(payload || "")}`;
    const parsed = parseSpecialJsonPayload(payload);
    let name = null;
    let location = null;
    if (Array.isArray(parsed)) {
      name = parsed[1] || null;
      location = parsed[2] || null;
    } else if (parsed && typeof parsed === "object") {
      name = parsed.name || parsed.title || parsed.label || null;
      location = parsed.location || parsed.subtitle || null;
    }
    const normName = normalizeSearchText(name || "");
    const normLocation = normalizeSearchText(location || "");
    return (activeEntityReferences || []).find(ref => {
      if (ref.token && ref.token === token) return true;
      const refName = normalizeSearchText(ref.name || "");
      const refLocation = normalizeSearchText(ref.location || ref.address || "");
      if (normName && refName === normName) return true;
      if (normName && refName.includes(normName) && (!normLocation || refLocation.includes(normLocation))) return true;
      return false;
    }) || null;
  }

  function normalizeCitationPayloadRefs(payload) {
    return String(payload || "")
      .split("")
      .map(item => item.trim())
      .filter(Boolean);
  }

  function findSourceReference(payload) {
    const token = `cite${String(payload || "")}`;
    const refs = normalizeCitationPayloadRefs(payload);
    return (activeSourceReferences || []).find(source => {
      if (source.token && source.token === token) return true;
      const sourceRefs = Array.isArray(source.refs) ? source.refs : [];
      if (!refs.length || !sourceRefs.length) return false;
      return refs.every(ref => sourceRefs.includes(ref)) || refs.some(ref => sourceRefs.includes(ref));
    }) || null;
  }

  function flattenSourceItems(sourceRef = {}) {
    const result = [];
    const add = item => {
      if (!item) return;
      result.push(item);
      if (Array.isArray(item.supporting_websites)) {
        for (const child of item.supporting_websites) result.push(child);
      }
    };
    for (const item of sourceRef.items || []) add(item);
    for (const item of sourceRef.fallback_items || []) add(item);
    if (!result.length && Array.isArray(sourceRef.safe_urls)) {
      sourceRef.safe_urls.forEach((url, index) => result.push({ title: url, url, attribution: null, snippet: null, refs: [] }));
    }
    const seen = new Set();
    return result.filter(item => {
      const key = String(item.url || item.title || "").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function renderSourcePreview(sourceRef, sourceId) {
    const items = flattenSourceItems(sourceRef);
    if (!items.length) {
      return `<span class="source-tooltip" id="${escapeHtml(sourceId)}-tooltip" role="tooltip">${escapeHtml(t("sourceUnavailable"))}</span>`;
    }
    const main = items[0];
    const others = items.slice(1, 4);
    const mainTitle = main.title || main.url || t("sourceLabel");
    const site = main.attribution ? `<span class="source-site">${escapeHtml(main.attribution)}</span>` : "";
    const snippet = main.snippet ? `<span class="source-snippet">${escapeHtml(main.snippet)}</span>` : "";
    const link = main.url ? `<a class="source-link" href="${escapeHtml(safeUrl(main.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("openSource"))}</a>` : "";
    const related = others.length ? `<span class="source-related"><strong>${escapeHtml(t("supportingSources"))}</strong>${others.map(item => `<a href="${escapeHtml(safeUrl(item.url || "#"))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title || item.attribution || item.url || t("sourceLabel"))}</a>`).join("")}</span>` : "";
    return `<span class="source-tooltip" id="${escapeHtml(sourceId)}-tooltip" role="tooltip"><strong>${escapeHtml(mainTitle)}</strong>${site}${snippet}${related}${link}</span>`;
  }

  function renderSourcePanel(sourceRef, sourceId) {
    const items = flattenSourceItems(sourceRef);
    const itemsHtml = items.length
      ? items.map((item, index) => {
          const title = item.title || item.url || `${t("sourceLabel")} ${index + 1}`;
          const attribution = item.attribution ? `<span class="source-site">${escapeHtml(item.attribution)}</span>` : "";
          const snippet = item.snippet ? `<span class="source-snippet">${escapeHtml(item.snippet)}</span>` : "";
          const link = item.url ? `<a class="source-link" href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("openSource"))}</a>` : "";
          return `<span class="source-panel-item"><strong>${escapeHtml(title)}</strong>${attribution}${snippet}${link}</span>`;
        }).join("")
      : `<span class="source-panel-item">${escapeHtml(t("sourceUnavailable"))}</span>`;
    return `<span class="source-panel" id="${escapeHtml(sourceId)}-panel" hidden><span class="source-panel-head"><strong>${escapeHtml(t("sourceDetailsLabel"))}</strong><button type="button" class="source-panel-close" aria-label="${escapeHtml(t("closeLabel"))}">×</button></span><span class="source-panel-list">${itemsHtml}</span></span>`;
  }


  function renderEntityToken(payload) {
    const parsed = parseSpecialJsonPayload(payload);
    let label = null;
    let secondary = null;
    let url = null;

    if (Array.isArray(parsed)) {
      label = parsed[1] || parsed[0] || null;
      secondary = parsed[2] || null;
    } else if (parsed && typeof parsed === "object") {
      label = parsed.name || parsed.title || parsed.label || parsed.text || parsed.display_name || null;
      secondary = parsed.location || parsed.subtitle || parsed.description || parsed.type || null;
      url = parsed.url || parsed.link || parsed.href || parsed.source_url || parsed.sourceUrl || null;
    }

    if (!label) {
      const quoted = decodeMinimalHtmlEntities(String(payload || "")).match(/"((?:\\.|[^"\\])+)"/g) || [];
      if (quoted.length >= 2) {
        try { label = JSON.parse(quoted[1]); } catch (_) { label = quoted[1].slice(1, -1); }
      }
    }

    const cleanLabel = String(label || "").trim();
    const cleanSecondary = String(secondary || "").trim();
    if (!cleanLabel) return "";

    const title = cleanSecondary ? ` title="${escapeHtml(cleanSecondary)}"` : "";
    const entityRef = findEntityReference(payload);
    const href = (url && /^https?:\/\//i.test(String(url)) ? safeUrl(url) : null) || (entityRef?.url ? safeUrl(entityRef.url) : null);

    if (href) {
      return `<a class="entity-token" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"${title}>${escapeHtml(cleanLabel)}</a>`;
    }

    return `<span class="entity-token"${title}>${escapeHtml(cleanLabel)}</span>`;
  }


  function renderCitationToken(payload) {
    const refs = normalizeCitationPayloadRefs(payload);
    const sourceRef = findSourceReference(payload);
    const count = sourceRef ? flattenSourceItems(sourceRef).length || refs.length || 1 : refs.length || 1;
    const label = count > 1 ? `${count} ${t("sourcesLabel")}` : t("sourceLabel");
    if (!sourceRef) {
      return `<span class="citation-token citation-token-unavailable" title="${escapeHtml(t("sourceUnavailable"))}">${escapeHtml(label)}</span>`;
    }
    const sourceId = `${safeDomId(activeSourceBaseId)}-source-${++activeSourceCounter}`;
    return `<span class="source-ref"><button type="button" class="citation-token source-ref-button" aria-describedby="${escapeHtml(sourceId)}-tooltip" aria-controls="${escapeHtml(sourceId)}-panel">${escapeHtml(label)}</button>${renderSourcePreview(sourceRef, sourceId)}${renderSourcePanel(sourceRef, sourceId)}</span>`;
  }

  function normalizeFileCitationPayloadParts(payload) {
    return String(payload || "")
      .split("")
      .map(item => item.trim())
      .filter(Boolean);
  }

  function parseLineRangeFromFileCitationPayload(payload) {
    const parts = normalizeFileCitationPayloadParts(payload);
    const linePart = parts.find(part => /^L\d+(?:-L?\d+)?$/i.test(part));
    if (!linePart) return { line_start: null, line_end: null };
    const match = linePart.match(/^L(\d+)(?:-L?(\d+))?$/i);
    if (!match) return { line_start: null, line_end: null };
    return {
      line_start: Number(match[1]) || null,
      line_end: Number(match[2] || match[1]) || null
    };
  }

  function sameFileCitationTarget(token, payload) {
    const tokenPayload = String(token || "").replace(/^filecite/, "").replace(/$/, "");
    const tokenParts = normalizeFileCitationPayloadParts(tokenPayload);
    const payloadParts = normalizeFileCitationPayloadParts(payload);
    return tokenParts.length && payloadParts.length && tokenParts[0] === payloadParts[0];
  }

  function findFileReference(payload) {
    const token = `filecite${String(payload || "")}`;
    return (activeFileReferences || []).find(ref => ref.token && ref.token === token)
      || (activeFileReferences || []).find(ref => ref.token && sameFileCitationTarget(ref.token, payload))
      || null;
  }

  function renderFileCitationToken(payload) {
    const fileRef = findFileReference(payload);
    const range = parseLineRangeFromFileCitationPayload(payload);
    const lineStart = fileRef?.line_start || range.line_start || null;
    const lineEnd = fileRef?.line_end || range.line_end || null;
    const lineLabel = lineStart ? `${t("fileLineRangeLabel")} ${lineStart}${lineEnd && lineEnd !== lineStart ? `-${lineEnd}` : ""}` : "";
    const name = fileRef?.name || normalizeFileCitationPayloadParts(payload)[0] || t("fileLabel");
    const title = [name, lineLabel].filter(Boolean).join(" — ") || t("fileUnavailable");
    const label = t("fileCitationLabel");
    const href = fileRef?.url ? safeUrl(fileRef.url) : null;
    if (href && href !== "#") {
      return `<a class="citation-token file-citation-token" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(title)}">${escapeHtml(label)}</a>`;
    }
    return `<span class="citation-token file-citation-token" title="${escapeHtml(title)}">${escapeHtml(label)}</span>`;
  }

  function renderFileNavlistToken(_payload) {
    return `<span class="citation-token file-citation-token" title="${escapeHtml(t("fileUnavailable"))}">${escapeHtml(t("fileLabel"))}</span>`;
  }

  function replaceSpecialTokens(text, placeholders) {
    return String(text || "")
      .replace(/entity([\s\S]*?)/g, (_match, payload) => holdHtml(placeholders, renderEntityToken(payload)))
      .replace(/cite([\s\S]*?)/g, (_match, payload) => holdHtml(placeholders, renderCitationToken(payload)))
      .replace(/filecite([\s\S]*?)/g, (_match, payload) => holdHtml(placeholders, renderFileCitationToken(payload)))
      .replace(/filenavlist([\s\S]*?)/g, (_match, payload) => holdHtml(placeholders, renderFileNavlistToken(payload)))
      .replace(/navlist([\s\S]*?)/g, "")
      .replace(/i([\s\S]*?)/g, "")
      .replace(/products([\s\S]*?)/g, "")
      .replace(/forecast([\s\S]*?)/g, "")
      .replace(/finance([\s\S]*?)/g, "")
      .replace(/schedule([\s\S]*?)/g, "")
      .replace(/standing([\s\S]*?)/g, "");
  }

  function renderInlinePlainMarkdown(text) {
    let html = escapeHtml(stripLeakedPrivatePlaceholders(text || ""));

    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, label, url) => {
      return `<a href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });

    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    html = html.replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>');
    html = html.replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/g, '<u>$1</u>');
    return html;
  }

  function tidyInlineMarkdownHtml(html) {
    return String(html || "")
      .replace(/\*\*((?:<a|<span)[^>]+class="[^"]*entity-token[^"]*"[\s\S]*?<\/(?:a|span)>)\*\*/g, '<strong>$1</strong>')
      .replace(/__(((?:<a|<span)[^>]+class="[^"]*entity-token[^"]*"[\s\S]*?<\/(?:a|span)>))__/g, '<strong>$1</strong>');
  }

  function renderInlineMarkdown(text) {
    // Les tokens ChatGPT utilisent aussi des caractères privés Unicode.
    // Il faut donc les interpréter AVANT tout nettoyage de placeholders internes.
    const source = String(text || "");
    const pattern = /(entity|cite|filecite|filenavlist|navlist|i|products|forecast|finance|schedule|standing|image_group)([\s\S]*?)/g;
    let lastIndex = 0;
    let match;
    const out = [];

    while ((match = pattern.exec(source)) !== null) {
      const before = source.slice(lastIndex, match.index);
      if (before) out.push(renderInlinePlainMarkdown(before));

      const kind = match[1];
      const payload = match[2];
      if (kind === "entity") out.push(renderEntityToken(payload));
      else if (kind === "cite") out.push(renderCitationToken(payload));
      else if (kind === "filecite") out.push(renderFileCitationToken(payload));
      else if (kind === "filenavlist") out.push(renderFileNavlistToken(payload));
      else out.push("");

      lastIndex = pattern.lastIndex;
    }

    const rest = source.slice(lastIndex);
    if (rest) out.push(renderInlinePlainMarkdown(rest));
    return tidyInlineMarkdownHtml(out.join(""));
  }
  function isTableSeparator(line) {
    const trimmed = line.trim();
    if (!trimmed.includes("|")) return false;
    const cells = trimmed.replace(/^\|/, "").replace(/\|$/, "").split("|");
    if (cells.length < 2) return false;
    return cells.every(cell => /^\s*:?-{3,}:?\s*$/.test(cell));
  }

  function splitTableRow(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(cell => cell.trim());
  }

  function renderTable(lines, start) {
    const header = splitTableRow(lines[start]);
    const rows = [];
    let i = start + 2;
    while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
      rows.push(splitTableRow(lines[i]));
      i++;
    }

    const head = header.map(cell => `<th>${renderInlineMarkdown(cell)}</th>`).join("");
    const body = rows.map(row => `<tr>${row.map(cell => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("\n");
    return {
      html: `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`,
      next: i
    };
  }

  function getListLineInfo(line, ordered) {
    const regex = ordered ? /^(\s*)\d+\.\s+(.+)$/ : /^(\s*)[-*+]\s+(.+)$/;
    const match = String(line || "").match(regex);
    if (!match) return null;
    return { indent: match[1].replace(/\t/g, "    ").length, text: match[2] };
  }

  function getAnyListLineInfo(line) {
    const unordered = getListLineInfo(line, false);
    if (unordered) return { ...unordered, ordered: false };
    const ordered = getListLineInfo(line, true);
    if (ordered) return { ...ordered, ordered: true };
    return null;
  }

  function renderList(lines, start, ordered) {
    const tag = ordered ? "ol" : "ul";
    const first = getListLineInfo(lines[start], ordered);
    if (!first) return { html: "", next: start + 1 };

    const baseIndent = first.indent;
    const items = [];
    let i = start;

    while (i < lines.length) {
      const info = getListLineInfo(lines[i], ordered);
      if (!info || info.indent !== baseIndent) break;

      let itemHtml = renderInlineMarkdown(info.text);
      i++;

      const nested = [];
      while (i < lines.length) {
        if (!String(lines[i] || "").trim()) break;
        const nextInfo = getAnyListLineInfo(lines[i]);
        if (!nextInfo) break;
        if (nextInfo.indent <= baseIndent) break;
        const rendered = renderList(lines, i, nextInfo.ordered);
        if (!rendered.html) break;
        nested.push(rendered.html);
        i = rendered.next;
      }

      items.push(`<li>${itemHtml}${nested.join("")}</li>`);
    }

    return { html: `<${tag}>${items.join("")}</${tag}>`, next: i };
  }


  function renderBlockquote(lines, start) {
    const parts = [];
    let i = start;
    while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
      parts.push(lines[i].replace(/^\s*>\s?/, ""));
      i++;
    }
    return { html: `<blockquote>${renderMarkdownSegment(parts.join("\n"))}</blockquote>`, next: i };
  }

  function isSpecialMarkdownStart(lines, i) {
    const line = lines[i] || "";
    const next = lines[i + 1] || "";
    return /^\s{0,3}#{1,6}\s+/.test(line)
      || /^\s*>\s?/.test(line)
      || /^\s*[-*+]\s+/.test(line)
      || /^\s*\d+\.\s+/.test(line)
      || /^\s*(-{3,}|_{3,}|\*{3,})\s*$/.test(line)
      || (line.includes("|") && isTableSeparator(next));
  }

  function renderParagraph(lines, start) {
    const parts = [];
    let i = start;
    while (i < lines.length && lines[i].trim() && !isSpecialMarkdownStart(lines, i)) {
      parts.push(lines[i]);
      i++;
    }
    return { html: `<p>${renderInlineMarkdown(parts.join("\n")).replace(/\n/g, "<br>")}</p>`, next: i };
  }

  function renderMarkdownSegment(text) {
    const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
    const out = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }

      const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = Math.min(6, heading[1].length + 1);
        out.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
        i++;
        continue;
      }

      if (/^\s*(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) {
        out.push("<hr>");
        i++;
        continue;
      }

      if (line.includes("|") && isTableSeparator(lines[i + 1] || "")) {
        const rendered = renderTable(lines, i);
        out.push(rendered.html);
        i = rendered.next;
        continue;
      }

      if (/^\s*>\s?/.test(line)) {
        const rendered = renderBlockquote(lines, i);
        out.push(rendered.html);
        i = rendered.next;
        continue;
      }

      if (/^\s*[-*+]\s+/.test(line)) {
        const rendered = renderList(lines, i, false);
        out.push(rendered.html);
        i = rendered.next;
        continue;
      }

      if (/^\s*\d+\.\s+/.test(line)) {
        const rendered = renderList(lines, i, true);
        out.push(rendered.html);
        i = rendered.next;
        continue;
      }

      const rendered = renderParagraph(lines, i);
      out.push(rendered.html);
      i = rendered.next;
    }

    return out.join("\n");
  }

  function renderMessageContentMarkdown(content, baseId, copyLabel, imageGroups = [], sourceReferences = [], entityReferences = [], fileReferences = []) {
    const previousSources = activeSourceReferences;
    const previousEntities = activeEntityReferences;
    const previousFiles = activeFileReferences;
    const previousBase = activeSourceBaseId;
    const previousCounter = activeSourceCounter;
    activeSourceReferences = Array.isArray(sourceReferences) ? sourceReferences : [];
    activeEntityReferences = Array.isArray(entityReferences) ? entityReferences : [];
    activeFileReferences = Array.isArray(fileReferences) ? fileReferences : [];
    activeSourceBaseId = baseId;
    activeSourceCounter = 0;

    try {
      let source = String(content || "").replace(/\r\n/g, "\n");
      source = source.replace(/^\[(Image jointe|Attached image)\s*:\s*sediment:\/\/file_[^\]]+\]\s*\n?/gmi, "");
      const pattern = /```([^\n`]*)\n([\s\S]*?)```/g;
      const imageState = { imageGroups: Array.isArray(imageGroups) ? imageGroups : [], imageGroupIndex: 0 };
      let lastIndex = 0;
      let match;
      let codeIndex = 1;
      const out = [];

      while ((match = pattern.exec(source)) !== null) {
        const before = source.slice(lastIndex, match.index);
        if (before.trim()) out.push(renderMarkdownWithImageGroups(before, baseId, imageState));

        const language = (match[1] || "text").trim() || "text";
        const code = match[2] || "";
        const codeId = `${safeDomId(baseId)}-code-${codeIndex++}`;
        const codeText = code.replace(/\n$/, "");
        out.push(`<figure class="code-block"><figcaption><span>${escapeHtml(language)}</span>${renderCopyButton(codeId, copyLabel, "code-copy")}</figcaption><pre><code id="${escapeHtml(codeId)}" class="language-${escapeHtml(language.toLowerCase())}">${highlightCode(codeText, language)}</code></pre></figure>`);
        lastIndex = pattern.lastIndex;
      }

      const rest = source.slice(lastIndex);
      if (rest.trim()) out.push(renderMarkdownWithImageGroups(rest, baseId, imageState));
      return out.join("\n") || "<p></p>";
    } finally {
      activeSourceReferences = previousSources;
      activeEntityReferences = previousEntities;
      activeFileReferences = previousFiles;
      activeSourceBaseId = previousBase;
      activeSourceCounter = previousCounter;
    }
  }

  function renderHTML(data) {
    const l = lang();
    const effectiveTheme = settings.htmlTheme === "light" || settings.htmlTheme === "dark" ? settings.htmlTheme : detectPageTheme();
    const layout = settings.htmlLayout === "full_width" ? "full_width" : "conversation";
    const isDark = effectiveTheme === "dark";
    const readableLabel = t("readableConversationTitle");
    const completeLabel = t("completeArchiveTitle");
    const modeLabel = data.export_mode === "complete_archive" ? completeLabel : readableLabel;
    const title = data.title || "ChatGPT Conversation";
    const messageDateLabel = t("messageDate");
    const updatedDateLabel = t("updatedDate");
    const copyLabel = t("copyButton");
    const copiedLabel = t("copiedButton");
    const compactReadable = data.export_mode !== "complete_archive";
    const messages = (data.messages || []).map(msg => {
      const imagePreviews = renderImagePreviews(msg.attachments);
      const attachments = renderAttachments(msg.attachments, l, compactReadable);
      const metadata = renderMetadata(msg.metadata);
      const updated = msg.timestamp_update ? `<span class="updated">${escapeHtml(updatedDateLabel)} : ${escapeHtml(msg.timestamp_update)}</span>` : "";
      const messageCopyId = `copy-message-${safeDomId(msg.index)}`;
      const messageBaseId = `message-${safeDomId(msg.index)}`;
      return `<article class="message ${escapeHtml(msg.role)}">
        ${renderCopyButton(messageCopyId, copyLabel, "message-copy")}
        <header><span class="index">#${escapeHtml(msg.index)}</span><strong>${escapeHtml(msg.speaker || msg.role)}</strong><span>${escapeHtml(messageDateLabel)} : ${escapeHtml(msg.timestamp_message || "")}</span>${updated}</header>
        <div class="copy-source" id="${escapeHtml(messageCopyId)}" hidden>${escapeHtml(msg.content || "")}</div>
        <div class="message-body">${renderMessageContentMarkdown(msg.content || "", messageBaseId, copyLabel, msg.image_groups || [], msg.source_references || [], msg.entity_references || [], msg.file_references || [])}</div>
        ${imagePreviews}
        ${attachments}
        ${metadata}
      </article>`;
    }).join("\n");

    return `<!doctype html>
<html lang="${escapeHtml(l)}">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)} — ${escapeHtml(modeLabel)}</title>
<style>
  :root { color-scheme: ${isDark ? "dark" : "light"}; }
  body { margin: 0; padding: 28px max(18px, 3vw); font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.55; background: ${isDark ? "#101014" : "#f6f6f7"}; color: ${isDark ? "#f4f4f5" : "#111"}; }
  main { max-width: 1360px; margin: 0 auto; }
  .top { background: ${isDark ? "#18181d" : "#fff"}; border: 1px solid ${isDark ? "#333" : "#ddd"}; border-radius: 14px; padding: 18px; margin-bottom: 18px; }
  h1 { margin: 0 0 8px; font-size: 26px; }
  .meta { display: grid; grid-template-columns: 180px 1fr; gap: 6px 12px; font-size: 13px; }
  .message { position: relative; box-sizing: border-box; background: ${isDark ? "#18181d" : "#fff"}; border: 1px solid ${isDark ? "#333" : "#ddd"}; border-left: 5px solid #777; border-radius: 12px; padding: 14px; margin: 14px 0; page-break-inside: avoid; overflow-wrap: anywhere; }
  .message.user { border-left-color: #149eca; }
  .message.assistant { border-left-color: #5d3fd3; }
  body.layout-conversation .message { max-width: min(72%, 920px); }
  body.layout-conversation .message.assistant { margin-right: auto; margin-left: 0; }
  body.layout-conversation .message.user { margin-left: auto; margin-right: 0; max-width: min(64%, 820px); }
  body.layout-conversation .code-block, body.layout-conversation .table-wrap { max-width: 100%; }
  header { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: baseline; color: ${isDark ? "#cfcfd5" : "#555"}; margin-bottom: 10px; padding-right: 30px; font-size: 13px; }
  header strong { color: ${isDark ? "#fff" : "#111"}; }
  .updated { color: ${isDark ? "#aeb4bf" : "#666"}; }
  .index { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; color: ${isDark ? "#aaa" : "#777"}; }
  .message-body { font-size: 15px; }
  .message-body p { margin: 0 0 12px; }
  .message-body p:last-child { margin-bottom: 0; }
  .message-body h2, .message-body h3, .message-body h4, .message-body h5, .message-body h6 { margin: 16px 0 8px; line-height: 1.25; }
  .message-body h2 { font-size: 22px; }
  .message-body h3 { font-size: 19px; }
  .message-body h4 { font-size: 17px; }
  .message-body ul, .message-body ol { margin: 0 0 12px 24px; padding: 0; }
  .message-body li { margin: 3px 0; }
  .message-body blockquote { margin: 12px 0; padding: 8px 12px; border-left: 4px solid ${isDark ? "#4b5563" : "#d0d7de"}; background: ${isDark ? "#141419" : "#f6f8fa"}; border-radius: 8px; }
  .inline-code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .92em; padding: 1px 4px; border-radius: 4px; background: ${isDark ? "#25262d" : "#eff1f3"}; }
  .code-block { box-sizing: border-box; max-width: 100%; margin: 14px 0; border: 1px solid ${isDark ? "#343541" : "#d0d7de"}; border-radius: 10px; overflow: hidden; background: ${isDark ? "#0d0d12" : "#f6f8fa"}; }
  .code-block figcaption { margin: 0; padding: 7px 9px 7px 11px; display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 12px; font-weight: 700; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; color: ${isDark ? "#d7d7df" : "#444"}; background: ${isDark ? "#20212a" : "#eaeef2"}; border-bottom: 1px solid ${isDark ? "#343541" : "#d0d7de"}; text-transform: lowercase; }
  .code-block pre { margin: 0; padding: 12px; overflow-x: auto; white-space: pre; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 13px; line-height: 1.5; }
  .code-block code .tok-comment { color: ${isDark ? "#8b949e" : "#6a737d"}; font-style: italic; }
  .code-block code .tok-string { color: ${isDark ? "#a5d6ff" : "#032f62"}; }
  .code-block code .tok-keyword { color: ${isDark ? "#ff7b72" : "#d73a49"}; }
  .code-block code .tok-number { color: ${isDark ? "#79c0ff" : "#005cc5"}; }
  .code-block code .tok-attr, .code-block code .tok-variable { color: ${isDark ? "#d2a8ff" : "#6f42c1"}; }
  .code-block code .tok-tag { color: ${isDark ? "#7ee787" : "#22863a"}; }
  .code-block code .tok-punct, .code-block code .tok-operator { color: ${isDark ? "#c9d1d9" : "#24292e"}; }

  .copy-button { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: 1px solid ${isDark ? "#3f4048" : "#d0d7de"}; border-radius: 7px; background: ${isDark ? "#20212a" : "#f6f8fa"}; color: ${isDark ? "#d7d7df" : "#444"}; cursor: pointer; opacity: .82; }
  .copy-button:hover { opacity: 1; background: ${isDark ? "#292a33" : "#eef1f4"}; }
  .copy-button svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .message-copy { position: absolute; top: 10px; right: 10px; }
  .code-copy { flex: 0 0 auto; width: 24px; height: 24px; }
  .copy-button.copied { color: ${isDark ? "#45c486" : "#09885a"}; border-color: ${isDark ? "#45c486" : "#09885a"}; }
  .table-wrap { overflow-x: auto; margin: 14px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { border: 1px solid ${isDark ? "#343541" : "#d0d7de"}; padding: 7px 9px; vertical-align: top; }
  th { background: ${isDark ? "#20212a" : "#f0f2f4"}; font-weight: 700; }
  tr:nth-child(even) td { background: ${isDark ? "#15161c" : "#fafafa"}; }
  details.media-previews { margin-top: 12px; font-size: 13px; border: 1px solid ${isDark ? "#2d2d34" : "#e0e0e4"}; border-radius: 8px; background: ${isDark ? "#131318" : "#f7f7f8"}; }
  details.media-previews summary { cursor: pointer; padding: 7px 9px; font-weight: 700; color: ${isDark ? "#d6d6dc" : "#333"}; }
  details.media-previews summary span { color: ${isDark ? "#aaa" : "#777"}; font-weight: 600; }
  details.media-previews ul { list-style: none; margin: 0; padding: 10px; display: grid; gap: 10px; }
  details.media-previews .image-gallery { display: flex; grid-template-columns: none; gap: 8px; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x proximity; padding-bottom: 12px; }
  .image-preview { flex: 0 0 210px; scroll-snap-align: start; }
  .image-preview figure { margin: 0; }
  .image-preview img { display: block; width: 100%; max-width: 100%; height: 132px; max-height: 180px; border-radius: 10px; border: 1px solid ${isDark ? "#343541" : "#d0d7de"}; background: ${isDark ? "#0d0d12" : "#fff"}; object-fit: cover; }
  .image-preview figcaption, .image-preview-unavailable span { display: block; margin-top: 5px; color: ${isDark ? "#aeb4bf" : "#666"}; font-size: 12px; }
  .image-error-text { display: none; margin-top: 5px; color: ${isDark ? "#aeb4bf" : "#666"}; font-size: 12px; }
  .image-load-error img { display: none; }
  .image-load-error figure { min-height: 132px; padding: 9px; border: 1px dashed ${isDark ? "#3f4048" : "#c9ced6"}; border-radius: 10px; }
  .image-load-error .image-error-text { display: block; }
  .image-preview-unavailable, .image-group-unavailable { margin: 10px; padding: 9px 10px; border: 1px dashed ${isDark ? "#3f4048" : "#c9ced6"}; border-radius: 8px; color: ${isDark ? "#aeb4bf" : "#666"}; }
  .image-gallery-info { margin: 0 10px 10px; padding: 9px 10px; border: 1px solid ${isDark ? "#343541" : "#d0d7de"}; border-radius: 9px; background: ${isDark ? "#181920" : "#fff"}; color: ${isDark ? "#cfcfd5" : "#555"}; }
  .image-gallery-info > strong { display: block; margin-bottom: 6px; color: ${isDark ? "#f4f4f5" : "#222"}; }
  .image-gallery-info > div { display: grid; gap: 4px; }
  .image-gallery-info > div > div { display: grid; grid-template-columns: 82px 1fr; gap: 8px; align-items: start; }
  .image-gallery-info span { color: ${isDark ? "#aeb4bf" : "#666"}; }
  .image-gallery-info strong { font-weight: 600; }
  .entity-token { font-weight: 700; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; color: inherit; }
  a.entity-token { color: ${isDark ? "#dbeafe" : "#0f4c81"}; }
  .citation-token { display: inline-flex; align-items: center; min-height: 1.2em; padding: 0 5px; border: 1px solid ${isDark ? "#3f4048" : "#d0d7de"}; border-radius: 999px; font-size: .78em; color: ${isDark ? "#cfd4dc" : "#555"}; background: ${isDark ? "#20212a" : "#f6f8fa"}; vertical-align: baseline; }
  .file-citation-token { margin-left: 3px; text-decoration: none; }
  details.attachments { margin-top: 12px; font-size: 13px; border: 1px solid ${isDark ? "#2d2d34" : "#e0e0e4"}; border-radius: 8px; background: ${isDark ? "#131318" : "#f7f7f8"}; }
  details.attachments summary { cursor: pointer; padding: 7px 9px; font-weight: 700; color: ${isDark ? "#d6d6dc" : "#333"}; }
  details.attachments summary span { color: ${isDark ? "#aaa" : "#777"}; font-weight: 600; }
  details.attachments ul { margin: 0; padding: 0 10px 9px 28px; }
  details.attachments li { margin: 4px 0; }
  details.metadata { margin-top: 12px; font-size: 12px; }
  details.metadata pre { margin-top: 8px; padding: 10px; border-radius: 8px; background: ${isDark ? "#101014" : "#f0f0f2"}; white-space: pre-wrap; overflow-wrap: anywhere; }
  a { color: #149eca; }
  .entity-token { font-weight: 700; color: inherit; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 3px; }
  .citation-token { display: inline-flex; align-items: center; vertical-align: baseline; border: 1px solid ${isDark ? "#3f4048" : "#d0d7de"}; border-radius: 999px; padding: 1px 6px; margin-left: 3px; font-size: .78em; color: ${isDark ? "#c8c8cf" : "#555"}; background: ${isDark ? "#20212a" : "#f6f8fa"}; }
  .source-ref { position: relative; display: inline-flex; align-items: center; vertical-align: baseline; }
  .source-ref-button { cursor: pointer; font: inherit; }
  .source-tooltip { display: none; position: absolute; left: 0; bottom: calc(100% + 8px); width: min(420px, 78vw); z-index: 40; padding: 10px 12px; border: 1px solid ${isDark ? "#3f4048" : "#d0d7de"}; border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,.28); background: ${isDark ? "#20212a" : "#fff"}; color: ${isDark ? "#f4f4f5" : "#111"}; font-size: 13px; line-height: 1.45; }
  .source-ref:hover .source-tooltip, .source-ref:focus-within .source-tooltip { display: block; }
  .source-site { margin-top: 2px; color: ${isDark ? "#9ca3af" : "#666"}; font-size: 12px; }
  .source-snippet { margin-top: 7px; color: ${isDark ? "#cfd4dc" : "#333"}; }
  .source-link { display: inline-flex; margin-top: 8px; font-weight: 700; }
  .source-related { margin-top: 9px; display: grid; gap: 4px; }
  .source-related strong { color: ${isDark ? "#d7d7df" : "#333"}; }
  .source-related a { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .source-panel { position: absolute; left: 0; top: calc(100% + 8px); width: min(520px, 82vw); max-height: 360px; overflow: auto; z-index: 50; padding: 12px; border: 1px solid ${isDark ? "#3f4048" : "#d0d7de"}; border-radius: 12px; box-shadow: 0 16px 42px rgba(0,0,0,.34); background: ${isDark ? "#18181d" : "#fff"}; color: ${isDark ? "#f4f4f5" : "#111"}; font-size: 13px; line-height: 1.45; }
  .source-panel[hidden] { display: none; }
  .source-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
  .source-panel-close { border: 1px solid ${isDark ? "#3f4048" : "#d0d7de"}; border-radius: 7px; background: ${isDark ? "#20212a" : "#f6f8fa"}; color: inherit; cursor: pointer; width: 26px; height: 26px; }
  .source-panel-list { display: grid; gap: 10px; }
  .source-panel-item { display: block; padding-left: 0; }
  hr { border: 0; border-top: 1px solid ${isDark ? "#333" : "#ddd"}; margin: 16px 0; }
  @media print {
    body { background: #fff; color: #111; padding: 12mm; }
    .top, .message { border-color: #ccc; }
    details.attachments:not([open]) > *:not(summary) { display: block; }
    .code-block { break-inside: avoid; }
    body.layout-conversation .message { max-width: 100%; }
    .copy-button { display: none; }
  }
</style>
</head>
<body class="layout-${escapeHtml(layout)}">
<main>
<section class="top">
<h1>${escapeHtml(title)}</h1>
<div class="meta">
  <div>${escapeHtml(t("mode"))}</div><div>${escapeHtml(modeLabel)}</div>
  <div>${escapeHtml(t("exportedAt"))}</div><div>${escapeHtml(data.exported_at)}</div>
  <div>${escapeHtml(t("urlLabel"))}</div><div>${escapeHtml(data.url)}</div>
  <div>${escapeHtml(t("messagesLabel"))}</div><div>${escapeHtml(data.export_stats?.exported_messages ?? data.messages?.length ?? "")}</div>
</div>
</section>
${messages}
</main>
<script>
(function () {
  const copyLabel = ${escapeJsString(copyLabel)};
  const copiedLabel = ${escapeJsString(copiedLabel)};
  function fallbackCopy(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); } finally { area.remove(); }
  }
  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    fallbackCopy(text);
  }
  document.addEventListener("click", event => {
    const close = event.target.closest(".source-panel-close");
    if (close) {
      const panel = close.closest(".source-panel");
      if (panel) panel.hidden = true;
      return;
    }
    const sourceButton = event.target.closest(".source-ref-button");
    if (sourceButton) {
      const wrapper = sourceButton.closest(".source-ref");
      const panel = wrapper ? wrapper.querySelector(".source-panel") : null;
      if (!panel) return;
      document.querySelectorAll(".source-panel:not([hidden])").forEach(open => {
        if (open !== panel) open.hidden = true;
      });
      panel.hidden = !panel.hidden;
      event.preventDefault();
      event.stopPropagation();
    } else if (!event.target.closest(".source-panel")) {
      document.querySelectorAll(".source-panel:not([hidden])").forEach(panel => { panel.hidden = true; });
    }
  });

  document.addEventListener("click", async event => {
    const button = event.target.closest("[data-copy-target]");
    if (!button) return;
    const target = document.getElementById(button.getAttribute("data-copy-target"));
    if (!target) return;
    try {
      await copyText(target.textContent || "");
      const oldTitle = button.getAttribute("title") || copyLabel;
      button.classList.add("copied");
      button.setAttribute("title", copiedLabel);
      button.setAttribute("aria-label", copiedLabel);
      setTimeout(() => {
        button.classList.remove("copied");
        button.setAttribute("title", oldTitle);
        button.setAttribute("aria-label", oldTitle);
      }, 1200);
    } catch (err) {
      console.error("Copy failed", err);
    }
  });
})();
</script>
</body>
</html>`;
  }

  function showExportNotice(message, kind = "success") {
    const id = "chatgpt-conversation-export-v100rc5-notice";
    const old = document.getElementById(id);
    if (old) old.remove();
    const isDark = detectPageTheme() === "dark";
    const root = document.createElement("div");
    root.id = id;
    root.setAttribute("role", "status");
    root.style.cssText = [
      "position:fixed",
      "right:18px",
      "top:116px",
      "z-index:2147483647",
      "max-width:360px",
      "font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",
      "font-size:13px",
      "line-height:1.45",
      "border-radius:12px",
      "box-shadow:0 12px 36px rgba(0,0,0,.32)",
      "backdrop-filter:blur(8px)",
      `border:1px solid ${isDark ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.14)"}`,
      `background:${isDark ? "rgba(32,33,35,.98)" : "rgba(255,255,255,.98)"}`,
      `color:${isDark ? "#f4f4f5" : "#111"}`,
      kind === "error" ? "border-left:5px solid #d84a4a" : "border-left:5px solid #149eca"
    ].join(";");
    const noticeBody = document.createElement("div");
    noticeBody.style.cssText = "display:flex;align-items:flex-start;gap:10px;padding:12px 12px 12px 14px";

    const noticeText = document.createElement("pre");
    noticeText.style.cssText = "margin:0;white-space:pre-wrap;font:inherit;flex:1";
    noticeText.textContent = message;
    noticeBody.appendChild(noticeText);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "OK");
    closeButton.style.cssText = "border:0;background:transparent;color:inherit;font-size:18px;line-height:1;cursor:pointer;padding:0 2px;opacity:.75";
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => root.remove());
    noticeBody.appendChild(closeButton);

    root.appendChild(noticeBody);
    document.documentElement.appendChild(root);
    if (kind !== "error") setTimeout(() => { if (root.isConnected) root.remove(); }, 14000);
  }

  async function main() {
    const exportedAt = formatDate();
    const conversationId = getConversationId();
    const steps = [];

    const baseDiagnostic = {
      exported_at: exportedAt,
      source: "ChatGPT",
      url: location.href,
      document_title: document.title || null,
      location_origin: location.origin,
      mode,
      conversation_id_detected: conversationId,
      user_agent: navigator.userAgent,
      context: "page_context_script_v54"
    };

    try {
      if (!conversationId) {
        steps.push({ ok: false, label: "conversation_id", error: "not_found" });
        const diag = { ...baseDiagnostic, steps };
        downloadJSON(diag, `chatgpt-conversation-export-diagnostic-${exportedAt}.json`);
        showExportNotice(t("conversationIdMissing"), "error");
        finish(diag);
        return;
      }

      steps.push({ ok: true, label: "conversation_id", value: conversationId });

      const apiUrl = `${location.origin}/backend-api/conversation/${conversationId}`;
      steps.push({ ok: true, label: "api_url", value: apiUrl });

      const session = await getSessionToken(steps);
      const fetched = await fetchConversation(apiUrl, session.token, steps);

      if (!fetched.raw) {
        const diag = {
          ...baseDiagnostic,
          steps,
          api_url: apiUrl,
          session_summary: session.sessionSummary,
          session_error: session.sessionError,
          failure: fetched.failure,
          note: "The session token is requested through /api/auth/session, then the backend call is tested without Authorization and with a Bearer token when available. No raw token is written to this diagnostic."
        };
        downloadJSON(diag, `chatgpt-conversation-export-diagnostic-${exportedAt}.json`);
        showExportNotice(`${t("apiUnavailable")} : ${fetched.status || "error"}\n${t("diagnosticDownloaded")}`, "error");
        finish(diag);
        return;
      }

      const raw = fetched.raw;
      const diagnosticMode = mode === "diagnostic";
      const exportFull = mode === "export_complete" || mode === "export_full";
      const includeTechnicalData = exportFull || diagnosticMode;
      const built = buildMessages(raw, exportedAt, {
        includeInternal: includeTechnicalData,
        includeMetadata: includeTechnicalData
      });
      hydrateImageGroups(built.messages, raw);

      if (diagnosticMode) {
        const diag = {
          ...baseDiagnostic,
          api_url: apiUrl,
          diagnostic_type: "api_and_parser_summary",
          diagnostic_scope: "summary_only_no_messages",
          session_summary: session.sessionSummary,
          session_error: session.sessionError,
          backend_status: fetched.status,
          backend_attempt_used: fetched.usedAttempt,
          session_token_present: !!session.token,
          raw_summary: {
            title_present: !!raw.title,
            raw_keys: Object.keys(raw || {}),
            mapping_nodes: raw.mapping ? Object.keys(raw.mapping).length : null,
            current_node_present: !!raw.current_node,
            create_time_present: raw.create_time != null,
            update_time_present: raw.update_time != null
          },
          parser_summary: {
            active_path_messages_raw: built.rawItems.length,
            complete_archive_messages_count: built.messages.length,
            readable_internal_messages_would_be_excluded: built.excluded.length,
            skipped_empty_messages: built.skippedEmpty.length,
            ignored_non_user_assistant_messages: built.roleIgnored.length
          },
          excluded_internal_summary: summarizeExcluded(built.excluded),
          steps,
          note: "This diagnostic intentionally excludes message contents, raw conversation payload, attachments, files and tokens. It only records API access results and parser counts."
        };
        downloadJSON(diag, `chatgpt-conversation-export-diagnostic-${exportedAt}.json`);
        showExportNotice(`${t("diagnosticDownloaded")}

${t("method")} : ${t("backendApi")}`, "success");
        finish({ diagnostic: true, backend_status: fetched.status, complete_archive_messages_count: built.messages.length });
        return;
      }

      const output = {
        exported_at: exportedAt,
        source: "ChatGPT",
        url: location.href,
        conversation_id: conversationId,
        title: raw.title || document.title || null,
        export_language: lang(),
        export_mode: exportFull ? "complete_archive" : "readable_conversation",
        export_mode_label: exportFull ? t("completeArchiveTitle") : t("readableConversationTitle"),
        export_format: exportFormat === "html" ? "html" : "json",
        export_format_label: exportFormat === "html" ? t("htmlFormat") : t("jsonFormat"),
        labels: {
          mode: t("mode"),
          exported_at: t("exportedAt"),
          messages: t("messagesLabel"),
          message: t("messageDate"),
          updated: t("updatedDate"),
          attachments: t("attachments"),
          metadata: t("metadataLabel"),
          copy: t("copyButton"),
          download: t("downloadAttachment"),
          source: t("sourceLabel"),
          sources: t("sourcesLabel"),
          readable_conversation: t("readableConversationTitle"),
          complete_archive: t("completeArchiveTitle"),
          user: t("userSpeaker"),
          assistant: t("chatgptSpeaker")
        },
        export_stats: {
          version: "1.0.0-rc5",
          extraction_method: "backend_api_page_context_with_session_token",
          backend_attempt_used: fetched.usedAttempt,
          raw_mapping_nodes: raw.mapping ? Object.keys(raw.mapping).length : null,
          active_path_messages_raw: built.rawItems.length,
          exported_messages: built.messages.length,
          excluded_internal_messages: exportFull ? 0 : built.excluded.length,
          skipped_empty_messages: built.skippedEmpty.length,
          ignored_non_user_assistant_messages: built.roleIgnored.length,
          first_message_preview: built.messages[0]?.content?.slice(0, 250) || null,
          last_message_preview: built.messages[built.messages.length - 1]?.content?.slice(0, 250) || null,
          backend_status: fetched.status,
          session_token_present: !!session.token
        },
        messages: built.messages
      };

      if (!exportFull) {
        output.excluded_internal_summary = summarizeExcluded(built.excluded);
      }


      const suffix = exportFull ? "complete" : "readable";
      if (exportFormat === "html") {
        downloadHTML(output, `chatgpt-conversation-export-${suffix}-${exportedAt}.html`);
      } else {
        downloadJSON(output, `chatgpt-conversation-export-${suffix}-${exportedAt}.json`);
      }
      const alertLines = [
        t("exportFinished"),
        "",
        `${t("mode")} : ${exportFull ? t("completeArchiveTitle") : t("readableConversationTitle")}`,
        `${t("messagesExported")} : ${built.messages.length}`
      ];

      if (!exportFull) {
        alertLines.push(`${t("internalMessagesExcluded")} : ${built.excluded.length}`);
      }

      alertLines.push(`${t("emptyEntriesIgnored")} : ${built.skippedEmpty.length}`);
      alertLines.push(`${t("method")} : ${t("backendApi")}`);

      showExportNotice(alertLines.join("\n"), "success");
      finish(output.export_stats);
    } catch (err) {
      const diag = {
        ...baseDiagnostic,
        steps,
        exception: String(err && err.stack ? err.stack : err)
      };
      downloadJSON(diag, `chatgpt-conversation-export-diagnostic-${exportedAt}.json`);
      showExportNotice(`${t("backendExportError")}\n\n${err && err.message ? err.message : String(err)}`, "error");
      finish(diag);
    }
  }

  await main();
})();
