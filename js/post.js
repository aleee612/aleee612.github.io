(() => {
  const STORAGE_KEYS = {
    fontScale: "readerFontScale",
    widthExpanded: "readerWidthExpanded",
    favorites: "favoritePosts"
  };

  const state = {
    post: null,
    posts: [],
    assets: [],
    headings: [],
    fontScale: 1,
    widthExpanded: false
  };

  const elements = {
    loadingState: document.getElementById("loadingState"),
    errorState: document.getElementById("errorState"),
    postContent: document.getElementById("postContent"),
    postTitle: document.getElementById("postTitle"),
    postSummary: document.getElementById("postSummary"),
    postCategory: document.getElementById("postCategory"),
    postDate: document.getElementById("postDate"),
    postReadTime: document.getElementById("postReadTime"),
    postWordCount: document.getElementById("postWordCount"),
    postPath: document.getElementById("postPath"),
    postBody: document.getElementById("postBody"),
    metaCategory: document.getElementById("metaCategory"),
    metaDate: document.getElementById("metaDate"),
    metaReadTime: document.getElementById("metaReadTime"),
    metaWordCount: document.getElementById("metaWordCount"),
    tagStrip: document.getElementById("tagStrip"),
    tocList: document.getElementById("tocList"),
    tocEmpty: document.getElementById("tocEmpty"),
    relatedList: document.getElementById("relatedList"),
    actionFeedback: document.getElementById("actionFeedback"),
    readingProgressBar: document.getElementById("readingProgressBar"),
    backToTopBtn: document.getElementById("backToTopBtn"),
    mobileToolsToggle: document.getElementById("mobileToolsToggle"),
    sideRail: document.getElementById("sideRail"),
    decreaseFontBtn: document.getElementById("decreaseFontBtn"),
    increaseFontBtn: document.getElementById("increaseFontBtn"),
    toggleWidthBtn: document.getElementById("toggleWidthBtn"),
    copyLinkBtn: document.getElementById("copyLinkBtn"),
    favoriteBtn: document.getElementById("favoriteBtn"),
    scrollTopBtn: document.getElementById("scrollTopBtn")
  };

  const calloutMeta = {
    note: { icon: "N", title: "Note" },
    abstract: { icon: "A", title: "Abstract" },
    summary: { icon: "S", title: "Summary" },
    info: { icon: "i", title: "Info" },
    todo: { icon: "T", title: "Todo" },
    tip: { icon: "*", title: "Tip" },
    success: { icon: "+", title: "Success" },
    question: { icon: "?", title: "Question" },
    warning: { icon: "!", title: "Warning" },
    caution: { icon: "!", title: "Caution" },
    attention: { icon: "!", title: "Attention" },
    failure: { icon: "x", title: "Failure" },
    danger: { icon: "!", title: "Danger" },
    error: { icon: "x", title: "Error" },
    bug: { icon: "#", title: "Bug" },
    example: { icon: ">", title: "Example" },
    quote: { icon: "\"", title: "Quote" }
  };

  function init() {
    restoreReaderPreferences();
    bindShellEvents();
    bindReaderEvents();
    loadPost().catch((error) => {
      console.error(error);
      showError();
    });
  }

  function restoreReaderPreferences() {
    const storedScale = Number(localStorage.getItem(STORAGE_KEYS.fontScale));
    state.fontScale = Number.isFinite(storedScale) && storedScale >= 0.9 && storedScale <= 1.3 ? storedScale : 1;
    document.documentElement.style.setProperty("--reader-scale", String(state.fontScale));

    state.widthExpanded = localStorage.getItem(STORAGE_KEYS.widthExpanded) === "true";
    document.body.classList.toggle("reader-width-expanded", state.widthExpanded);
    elements.toggleWidthBtn.classList.toggle("is-active", state.widthExpanded);
  }

  function bindShellEvents() {
    window.addEventListener("scroll", handleViewportEffects, { passive: true });
    elements.backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    elements.mobileToolsToggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("mobile-tools-open");
      elements.mobileToolsToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      if (window.innerWidth > 760) {
        return;
      }

      const clickedInsideRail = elements.sideRail.contains(event.target);
      const clickedToggle = elements.mobileToolsToggle.contains(event.target);

      if (!clickedInsideRail && !clickedToggle) {
        closeMobileTools();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        closeMobileTools();
      }
    });
  }

  function bindReaderEvents() {
    elements.decreaseFontBtn.addEventListener("click", () => {
      updateFontScale(-0.05);
    });

    elements.increaseFontBtn.addEventListener("click", () => {
      updateFontScale(0.05);
    });

    elements.toggleWidthBtn.addEventListener("click", () => {
      state.widthExpanded = !state.widthExpanded;
      document.body.classList.toggle("reader-width-expanded", state.widthExpanded);
      elements.toggleWidthBtn.classList.toggle("is-active", state.widthExpanded);
      localStorage.setItem(STORAGE_KEYS.widthExpanded, String(state.widthExpanded));
      setFeedback(state.widthExpanded ? "已切换为更宽阅读版式。" : "已恢复默认阅读宽度。");
    });

    elements.copyLinkBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setFeedback("文章链接已复制。");
      } catch (error) {
        console.error(error);
        setFeedback("复制失败，请手动复制当前地址。");
      }
    });

    elements.favoriteBtn.addEventListener("click", () => {
      if (!state.post) {
        return;
      }

      const favorites = getFavorites();
      const exists = favorites.includes(String(state.post.id));
      const nextFavorites = exists
        ? favorites.filter((item) => item !== String(state.post.id))
        : favorites.concat(String(state.post.id));

      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(nextFavorites));
      syncFavoriteButton();
      setFeedback(exists ? "已取消收藏。" : "文章已加入收藏。");
    });

    elements.scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  async function loadPost() {
    const postId = new URLSearchParams(window.location.search).get("id");

    if (!postId) {
      showError();
      return;
    }

    const postsResponse = await fetch("./data/posts.json");

    if (!postsResponse.ok) {
      throw new Error("Failed to load posts.json");
    }

    state.posts = await postsResponse.json();
    const assetsResponse = await fetch("./data/assets.json").catch(() => null);
    state.assets = assetsResponse && assetsResponse.ok ? await assetsResponse.json() : [];

    const post = state.posts.find((item) => String(item.id) === postId);

    if (!post) {
      showError();
      return;
    }

    const markdownResponse = await fetch(`./posts/${encodeURI(post.file).replace(/#/g, "%23")}`);

    if (!markdownResponse.ok) {
      throw new Error(`Failed to load markdown for ${post.file}`);
    }

    const markdown = stripFrontmatter(await markdownResponse.text());
    state.post = post;

    renderPost(post, markdown);
    hideStates();
  }

  function renderPost(post, markdown) {
    const stats = getReadingStats(markdown);
    const summary = post.summary || buildSummary(markdown);
    const category = post.folder ? post.folder.split("/")[0] : "Root";

    document.title = `${post.title} - aleee`;
    elements.postTitle.textContent = post.title;
    elements.postCategory.textContent = category;
    elements.postPath.textContent = post.file;
    elements.postReadTime.textContent = `${stats.minutes} min read`;
    elements.postWordCount.textContent = `${stats.words} words`;
    elements.metaCategory.textContent = category;
    elements.metaReadTime.textContent = `${stats.minutes} min`;
    elements.metaWordCount.textContent = String(stats.words);

    if (post.date) {
      const formattedDate = formatDate(post.date);
      elements.postDate.hidden = false;
      elements.postDate.textContent = formattedDate;
      elements.metaDate.textContent = formattedDate;
    } else {
      elements.postDate.hidden = true;
      elements.metaDate.textContent = "-";
    }

    if (summary) {
      elements.postSummary.hidden = false;
      elements.postSummary.textContent = summary;
    } else {
      elements.postSummary.hidden = true;
    }

    renderTags(post.tags || []);
    renderMarkdown(markdown);
    renderRelatedPosts(post);
    syncFavoriteButton();
    handleViewportEffects();
  }

  function renderTags(tags) {
    elements.tagStrip.innerHTML = "";

    if (!Array.isArray(tags) || tags.length === 0) {
      return;
    }

    tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      chip.textContent = `#${tag}`;
      elements.tagStrip.appendChild(chip);
    });
  }

  function renderMarkdown(markdown) {
    if (!window.marked || typeof window.marked.parse !== "function") {
      throw new Error("marked is not available");
    }

    window.marked.setOptions({
      gfm: true,
      breaks: true
    });

    const preparedMarkdown = preprocessMarkdown(markdown);
    const renderedHtml = window.marked.parse(preparedMarkdown);
    elements.postBody.innerHTML = renderedHtml || "<p>暂无内容。</p>";

    rewriteStandardAssets(elements.postBody);
    decorateHeadings(elements.postBody);
    upgradeCallouts(elements.postBody);
    resolveInternalLinks(elements.postBody);
    resolveEmbeds(elements.postBody);
    decorateExternalLinks(elements.postBody);
    processMermaid(elements.postBody);
    renderMath(elements.postBody);
    buildToc(elements.postBody);
  }

  function preprocessMarkdown(markdown) {
    const blocks = markdown.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g);

    return blocks
      .map((block, index) => (index % 2 === 1 ? block : transformObsidianText(block)))
      .join("");
  }

  function transformObsidianText(input) {
    const inlineCode = [];
    let text = input.replace(/`[^`\n]+`/g, (match) => {
      const token = `@@INLINE_CODE_${inlineCode.length}@@`;
      inlineCode.push(match);
      return token;
    });

    text = text.replace(/%%[\s\S]*?%%/g, "");
    text = text.replace(/!\[\[([^\]]+)\]\]/g, (_, rawTarget) => {
      return `<span class="obsidian-embed" data-target="${escapeAttribute(rawTarget.trim())}"></span>`;
    });
    text = text.replace(/\[\[([^\]]+)\]\]/g, (_, rawTarget) => {
      const parsed = parseObsidianTarget(rawTarget.trim());
      return `<a href="#" class="internal-link" data-target="${escapeAttribute(rawTarget.trim())}">${escapeHtml(parsed.displayText)}</a>`;
    });
    text = text.replace(/==([^=\n][\s\S]*?[^=\n])==/g, "<mark>$1</mark>");

    return text.replace(/@@INLINE_CODE_(\d+)@@/g, (_, index) => inlineCode[Number(index)] || "");
  }

  function decorateExternalLinks(container) {
    container.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || link.classList.contains("internal-link")) {
        return;
      }

      if (/^https?:\/\//i.test(href)) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noreferrer");
      }
    });
  }

  function rewriteStandardAssets(container) {
    const currentFolder = normalizePath(state.post?.folder || "");

    Array.from(container.querySelectorAll("img[src]")).forEach((image) => {
      const rawSrc = image.getAttribute("src");

      if (!rawSrc) {
        return;
      }

      if (isDrivePath(rawSrc)) {
        replaceBrokenImage(image, rawSrc);
        return;
      }

      if (isPublicUrl(rawSrc) || rawSrc.startsWith("/") || rawSrc.startsWith("#")) {
        return;
      }

      image.src = toPostAssetUrl(resolveRelativePath(currentFolder, rawSrc));
    });

    Array.from(container.querySelectorAll("a[href]:not(.internal-link)")).forEach((link) => {
      const rawHref = link.getAttribute("href");

      if (!rawHref) {
        return;
      }

      if (isDrivePath(rawHref)) {
        link.classList.add("is-missing");
        link.removeAttribute("href");
        link.title = "本地绝对路径无法在网页端访问";
        return;
      }

      if (isPublicUrl(rawHref) || rawHref.startsWith("/") || rawHref.startsWith("#")) {
        return;
      }

      const [rawPath, rawHash = ""] = rawHref.split("#");

      if (/\.md$/i.test(rawPath)) {
        const parsed = {
          raw: rawHref,
          cleanTarget: resolveRelativePath(currentFolder, rawPath),
          anchorText: rawHash.trim(),
          displayText: link.textContent.trim()
        };
        const note = resolvePostTarget(parsed);

        if (note) {
          const anchorId = parsed.anchorText ? slugify(parsed.anchorText.replace(/^\^/, "")) : "";
          link.href = `./post.html?id=${encodeURIComponent(note.id)}${anchorId ? `#${anchorId}` : ""}`;
          return;
        }
      }

      link.href = `${toPostAssetUrl(resolveRelativePath(currentFolder, rawPath))}${rawHash ? `#${rawHash}` : ""}`;
    });
  }

  function decorateHeadings(container) {
    const usedIds = new Set();
    const headings = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"));

    headings.forEach((heading) => {
      const slug = buildHeadingId(heading.textContent || "section", usedIds);
      heading.id = slug;

      const anchor = document.createElement("a");
      anchor.className = "heading-anchor";
      anchor.href = `#${slug}`;
      anchor.textContent = "#";
      anchor.setAttribute("aria-label", `跳转到 ${heading.textContent}`);
      heading.prepend(anchor);
    });
  }

  function upgradeCallouts(container) {
    const blockquotes = Array.from(container.querySelectorAll("blockquote"));

    blockquotes.forEach((blockquote) => {
      const firstParagraph = blockquote.querySelector(":scope > p");

      if (!firstParagraph) {
        return;
      }

      const match = firstParagraph.textContent.trim().match(/^\[!([A-Za-z0-9_-]+)\]([+-])?\s*(.*)$/);

      if (!match) {
        return;
      }

      const kind = match[1].toLowerCase();
      const foldMarker = match[2] || "";
      const meta = calloutMeta[kind] || { icon: "i", title: kind };
      const title = match[3] || meta.title;
      const wrapper = document.createElement(foldMarker ? "details" : "section");
      wrapper.className = `callout callout--${kind}`;

      if (foldMarker && foldMarker !== "-") {
        wrapper.open = true;
      }

      const summary = document.createElement(foldMarker ? "summary" : "div");
      summary.className = "callout__summary";
      summary.innerHTML = `
        <span class="callout__icon">${meta.icon}</span>
        <span>${escapeHtml(title)}</span>
      `;

      const body = document.createElement("div");
      body.className = "callout__body";

      Array.from(blockquote.childNodes).forEach((child, index) => {
        if (index === 0) {
          return;
        }
        body.appendChild(child);
      });

      wrapper.appendChild(summary);
      if (body.childNodes.length > 0) {
        wrapper.appendChild(body);
      }

      blockquote.replaceWith(wrapper);
    });
  }

  function resolveInternalLinks(container) {
    const links = Array.from(container.querySelectorAll(".internal-link[data-target]"));

    links.forEach((link) => {
      const parsed = parseObsidianTarget(link.dataset.target || "");
      const note = resolvePostTarget(parsed);
      const asset = note ? null : resolveAssetTarget(parsed);
      const anchorId = parsed.anchorText ? slugify(parsed.anchorText.replace(/^\^/, "")) : "";

      if (note) {
        const isCurrent = String(note.id) === String(state.post.id);
        link.href = isCurrent
          ? anchorId ? `#${anchorId}` : window.location.pathname + window.location.search
          : `./post.html?id=${encodeURIComponent(note.id)}${anchorId ? `#${anchorId}` : ""}`;
        return;
      }

      if (asset) {
        link.href = `./posts/${encodeURI(asset.file).replace(/#/g, "%23")}`;
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noreferrer");
        return;
      }

      link.classList.add("is-missing");
      link.title = "未找到对应笔记或附件";
      link.href = "#";
    });
  }

  function resolveEmbeds(container) {
    const placeholders = Array.from(container.querySelectorAll(".obsidian-embed[data-target]"));

    placeholders.forEach((placeholder) => {
      const parsed = parseObsidianTarget(placeholder.dataset.target || "");
      const note = resolvePostTarget(parsed);
      const asset = note ? null : resolveAssetTarget(parsed);
      const embedNode = document.createElement("div");
      embedNode.className = "obsidian-embed-card";

      if (note) {
        const anchorId = parsed.anchorText ? slugify(parsed.anchorText.replace(/^\^/, "")) : "";
        embedNode.innerHTML = `
          <a class="obsidian-embed-card__title" href="./post.html?id=${encodeURIComponent(note.id)}${anchorId ? `#${anchorId}` : ""}">${escapeHtml(parsed.displayText || note.title)}</a>
          <span class="obsidian-embed-card__meta">${escapeHtml(note.file)}</span>
        `;
        replacePlaceholder(placeholder, embedNode);
        return;
      }

      if (asset) {
        renderAssetEmbed(embedNode, asset, parsed.displayText);
        replacePlaceholder(placeholder, embedNode);
        return;
      }

      embedNode.classList.add("is-missing");
      embedNode.innerHTML = `
        <span class="obsidian-embed-card__title">嵌入内容未找到</span>
        <span class="obsidian-embed-card__meta">${escapeHtml(parsed.raw)}</span>
      `;
      replacePlaceholder(placeholder, embedNode);
    });
  }

  function renderAssetEmbed(container, asset, displayText) {
    const assetUrl = `./posts/${encodeURI(asset.file).replace(/#/g, "%23")}`;
    const label = displayText || asset.name;
    const extension = (asset.ext || "").toLowerCase();

    container.innerHTML = `
      <span class="obsidian-embed-card__title">${escapeHtml(label)}</span>
      <span class="obsidian-embed-card__meta">${escapeHtml(asset.file)}</span>
    `;

    if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp"].includes(extension)) {
      const image = document.createElement("img");
      image.src = assetUrl;
      image.alt = label;
      container.appendChild(image);
      return;
    }

    if ([".mp4", ".webm", ".mov", ".m4v"].includes(extension)) {
      const video = document.createElement("video");
      video.src = assetUrl;
      video.controls = true;
      video.preload = "metadata";
      container.appendChild(video);
      return;
    }

    if ([".mp3", ".wav", ".ogg", ".m4a"].includes(extension)) {
      const audio = document.createElement("audio");
      audio.src = assetUrl;
      audio.controls = true;
      audio.preload = "metadata";
      container.appendChild(audio);
      return;
    }

    if (extension === ".pdf") {
      const frame = document.createElement("iframe");
      frame.src = assetUrl;
      frame.title = label;
      container.appendChild(frame);
      return;
    }

    const link = document.createElement("a");
    link.className = "chip-link";
    link.href = assetUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "打开附件";
    container.appendChild(link);
  }

  function replacePlaceholder(placeholder, replacement) {
    const parent = placeholder.parentElement;
    if (parent && parent.tagName === "P" && parent.childNodes.length === 1) {
      parent.replaceWith(replacement);
      return;
    }

    placeholder.replaceWith(replacement);
  }

  function replaceBrokenImage(image, rawPath) {
    const missing = document.createElement("div");
    missing.className = "obsidian-embed-card is-missing";
    missing.innerHTML = `
      <span class="obsidian-embed-card__title">图片资源不可访问</span>
      <span class="obsidian-embed-card__meta">${escapeHtml(rawPath)}</span>
    `;
    replacePlaceholder(image, missing);
  }

  function processMermaid(container) {
    if (!window.mermaid) {
      return;
    }

    window.mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });

    const codeBlocks = Array.from(container.querySelectorAll("pre code.language-mermaid"));

    codeBlocks.forEach((codeBlock, index) => {
      const host = document.createElement("div");
      host.className = "mermaid";
      host.id = `mermaid-${index}-${Date.now()}`;
      host.textContent = codeBlock.textContent || "";
      const pre = codeBlock.parentElement;
      if (pre) {
        pre.replaceWith(host);
      }
    });

    const mermaidNodes = Array.from(container.querySelectorAll(".mermaid"));
    if (mermaidNodes.length > 0) {
      Promise.resolve(window.mermaid.run({ nodes: mermaidNodes })).catch((error) => {
        console.error("Mermaid render failed:", error);
      });
    }
  }

  function renderMath(container) {
    if (typeof window.renderMathInElement !== "function") {
      return;
    }

    window.renderMathInElement(container, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
      throwOnError: false
    });
  }

  function buildToc(container) {
    elements.tocList.innerHTML = "";
    state.headings = Array.from(container.querySelectorAll("h1, h2, h3, h4")).map((heading) => ({
      id: heading.id,
      text: heading.textContent.replace(/^#/, "").trim(),
      level: Number(heading.tagName.slice(1)),
      node: heading
    }));

    elements.tocEmpty.hidden = state.headings.length > 0;

    state.headings.forEach((item) => {
      const link = document.createElement("a");
      link.className = "toc-link";
      link.dataset.level = String(item.level);
      link.href = `#${item.id}`;
      link.textContent = item.text;
      link.addEventListener("click", () => {
        closeMobileTools();
      });
      elements.tocList.appendChild(link);
    });

    updateActiveToc();
  }

  function updateActiveToc() {
    if (state.headings.length === 0) {
      return;
    }

    let activeId = state.headings[0].id;

    state.headings.forEach((heading) => {
      if (window.scrollY >= heading.node.offsetTop - 140) {
        activeId = heading.id;
      }
    });

    Array.from(elements.tocList.querySelectorAll(".toc-link")).forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
    });
  }

  function renderRelatedPosts(currentPost) {
    const currentTags = new Set((currentPost.tags || []).map((tag) => String(tag).toLowerCase()));
    const currentFolder = normalizePath(currentPost.folder || "");

    const related = state.posts
      .filter((post) => post.id !== currentPost.id)
      .map((post) => {
        let score = 0;
        const postFolder = normalizePath(post.folder || "");

        if (currentFolder && postFolder === currentFolder) {
          score += 6;
        }

        (post.tags || []).forEach((tag) => {
          if (currentTags.has(String(tag).toLowerCase())) {
            score += 3;
          }
        });

        if (getBaseName(post.file).toLowerCase().includes(getBaseName(currentPost.file).toLowerCase())) {
          score += 1;
        }

        return { post, score };
      })
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score || String(left.post.file).localeCompare(String(right.post.file)))
      .slice(0, 6);

    elements.relatedList.innerHTML = "";

    if (related.length === 0) {
      elements.relatedList.innerHTML = '<div class="side-card__empty">暂无可推荐的相邻笔记。</div>';
      return;
    }

    related.forEach(({ post }) => {
      const link = document.createElement("a");
      link.className = "related-link";
      link.href = `./post.html?id=${encodeURIComponent(post.id)}`;
      link.innerHTML = `
        <span class="related-link__title">${escapeHtml(post.title)}</span>
        <span class="related-link__meta">${escapeHtml(post.file)}</span>
      `;
      elements.relatedList.appendChild(link);
    });
  }

  function syncFavoriteButton() {
    const favorites = getFavorites();
    const isActive = state.post ? favorites.includes(String(state.post.id)) : false;
    elements.favoriteBtn.classList.toggle("is-active", isActive);
    elements.favoriteBtn.textContent = isActive ? "取消收藏" : "收藏文章";
  }

  function updateFontScale(delta) {
    const nextValue = clampNumber(state.fontScale + delta, 0.9, 1.3);
    state.fontScale = Number(nextValue.toFixed(2));
    document.documentElement.style.setProperty("--reader-scale", String(state.fontScale));
    localStorage.setItem(STORAGE_KEYS.fontScale, String(state.fontScale));
    setFeedback(`正文缩放已调整为 ${Math.round(state.fontScale * 100)}%。`);
  }

  function handleViewportEffects() {
    const scrollTop = window.scrollY;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

    elements.readingProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    elements.backToTopBtn.classList.toggle("is-visible", scrollTop > 320);
    updateActiveToc();
  }

  function closeMobileTools() {
    document.body.classList.remove("mobile-tools-open");
    elements.mobileToolsToggle.setAttribute("aria-expanded", "false");
  }

  function showError() {
    elements.loadingState.hidden = true;
    elements.postContent.hidden = true;
    elements.errorState.hidden = false;
  }

  function hideStates() {
    elements.loadingState.hidden = true;
    elements.errorState.hidden = true;
    elements.postContent.hidden = false;
  }

  function setFeedback(message) {
    elements.actionFeedback.textContent = message;
  }

  function getFavorites() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || "[]");
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  function stripFrontmatter(content) {
    return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  }

  function buildSummary(markdown) {
    const plainText = toPlainText(markdown).replace(/\s+/g, " ").trim();
    return plainText ? plainText.slice(0, 140) + (plainText.length > 140 ? "..." : "") : "";
  }

  function getReadingStats(markdown) {
    const plainText = toPlainText(markdown);
    const chineseChars = (plainText.match(/[\u4e00-\u9fff]/g) || []).length;
    const latinWords = plainText.match(/[A-Za-z0-9_]+/g) || [];
    const words = chineseChars + latinWords.length;
    const minutes = Math.max(1, Math.ceil(words / 260));
    return { words, minutes };
  }

  function toPlainText(markdown) {
    return markdown
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`\n]+`/g, " ")
      .replace(/!\[\[([^\]]+)\]\]/g, " ")
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^>\s?/gm, " ")
      .replace(/[#>*_\-~|]/g, " ")
      .replace(/\s+/g, " ");
  }

  function parseObsidianTarget(raw) {
    const initial = raw.trim();
    const pipeIndex = initial.indexOf("|");
    const base = pipeIndex >= 0 ? initial.slice(0, pipeIndex) : initial;
    const customDisplay = pipeIndex >= 0 ? initial.slice(pipeIndex + 1).trim() : "";
    const hashIndex = base.indexOf("#");
    const cleanTarget = hashIndex >= 0 ? base.slice(0, hashIndex).trim() : base.trim();
    const anchorText = hashIndex >= 0 ? base.slice(hashIndex + 1).trim() : "";
    const fallbackDisplay = customDisplay || anchorText || getDisplayName(cleanTarget || initial);

    return {
      raw: initial,
      cleanTarget,
      anchorText,
      displayText: fallbackDisplay
    };
  }

  function getDisplayName(value) {
    return value.split("/").pop().replace(/\.[^.]+$/, "") || value;
  }

  function resolvePostTarget(parsed) {
    if (!state.post) {
      return null;
    }

    if (!parsed.cleanTarget && parsed.anchorText) {
      return state.post;
    }

    const query = normalizeTargetKey(parsed.cleanTarget);
    if (!query) {
      return null;
    }

    const currentFolder = normalizePath(state.post.folder || "");
    let bestMatch = null;
    let bestScore = 0;

    state.posts.forEach((post) => {
      const normalizedFile = normalizePath(post.file);
      const normalizedFileNoExt = normalizedFile.replace(/\.md$/i, "");
      const stem = normalizeTargetKey(getBaseName(post.file));
      const title = normalizeTargetKey(post.title || "");
      const aliases = Array.isArray(post.aliases) ? post.aliases.map(normalizeTargetKey) : [];
      const targetHasPath = parsed.cleanTarget.includes("/");
      let score = 0;

      if (targetHasPath) {
        const normalizedTargetPath = normalizePath(parsed.cleanTarget).replace(/\.md$/i, "");
        if (normalizedFileNoExt === normalizedTargetPath) {
          score = 120;
        } else if (normalizedFileNoExt.endsWith(`/${normalizedTargetPath}`)) {
          score = 95;
        }
      } else {
        if (stem === query) {
          score = 100;
        } else if (title === query) {
          score = 96;
        } else if (aliases.includes(query)) {
          score = 94;
        } else if (normalizedFileNoExt === query) {
          score = 92;
        }
      }

      if (score > 0 && currentFolder && normalizedFile.startsWith(`${currentFolder}/`)) {
        score += 4;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = post;
      }
    });

    return bestMatch;
  }

  function resolveAssetTarget(parsed) {
    if (state.assets.length === 0) {
      return null;
    }

    const query = normalizeTargetKey(parsed.cleanTarget || parsed.raw);
    const currentFolder = normalizePath(state.post?.folder || "");
    let bestMatch = null;
    let bestScore = 0;

    state.assets.forEach((asset) => {
      const normalizedFile = normalizePath(asset.file);
      const normalizedFileNoExt = normalizedFile.replace(/\.[^.]+$/i, "");
      const normalizedName = normalizeTargetKey(asset.name || "");
      const normalizedBase = normalizeTargetKey(asset.basename || "");
      const targetHasPath = (parsed.cleanTarget || parsed.raw).includes("/");
      let score = 0;

      if (targetHasPath) {
        const normalizedTargetPath = normalizePath(parsed.cleanTarget || parsed.raw).replace(/\.[^.]+$/i, "");
        if (normalizedFileNoExt === normalizedTargetPath) {
          score = 120;
        } else if (normalizedFileNoExt.endsWith(`/${normalizedTargetPath}`)) {
          score = 95;
        }
      } else if (normalizedName === query || normalizedBase === query) {
        score = normalizedName === query ? 100 : 96;
      }

      if (score > 0 && currentFolder && normalizedFile.startsWith(`${currentFolder}/`)) {
        score += 4;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = asset;
      }
    });

    return bestMatch;
  }

  function buildHeadingId(text, usedIds) {
    let base = slugify(text);
    if (!base) {
      base = "section";
    }

    let candidate = base;
    let suffix = 2;

    while (usedIds.has(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    usedIds.add(candidate);
    return candidate;
  }

  function slugify(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function normalizeTargetKey(value) {
    return String(value || "")
      .trim()
      .replace(/\\/g, "/")
      .replace(/\.md$/i, "")
      .toLowerCase();
  }

  function normalizePath(value) {
    return String(value || "").trim().replace(/\\/g, "/");
  }

  function resolveRelativePath(currentFolder, rawPath) {
    const folderParts = currentFolder ? normalizePath(currentFolder).split("/").filter(Boolean) : [];
    const pathParts = normalizePath(rawPath).split("/").filter(Boolean);

    pathParts.forEach((part) => {
      if (part === ".") {
        return;
      }

      if (part === "..") {
        folderParts.pop();
        return;
      }

      folderParts.push(part);
    });

    return folderParts.join("/");
  }

  function toPostAssetUrl(relativePath) {
    return `./posts/${encodeURI(relativePath).replace(/#/g, "%23")}`;
  }

  function isDrivePath(value) {
    return /^[A-Za-z]:[\\/]/.test(String(value || "").trim());
  }

  function isPublicUrl(value) {
    return /^(https?:|mailto:|tel:|data:)/i.test(String(value || "").trim());
  }

  function getBaseName(file) {
    const normalized = normalizePath(file);
    const lastPart = normalized.split("/").pop() || normalized;
    return lastPart.replace(/\.[^.]+$/, "");
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function escapeAttribute(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
