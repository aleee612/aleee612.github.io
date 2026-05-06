(function () {
  const text = {
    searchPlaceholder: "\u641c\u6807\u9898\u3001\u8def\u5f84\u3001\u5206\u7c7b",
    heroEyebrow: "\u7b14\u8bb0\u9996\u9875",
    heroTitle: "\u5e73\u65f6\u8bb0\u7684\u4e1c\u897f\uff0c\u5148\u653e\u8fd9\u513f\u3002",
    heroIntro: "\u4e3b\u8981\u662f\u5f00\u53d1\u3001\u64cd\u4f5c\u7cfb\u7edf\u3001\u8ba1\u7b97\u673a\u7f51\u7edc\u3001\u8003\u7814\u6574\u7406\uff0c\u8fd8\u6709\u4e00\u4e9b\u96f6\u6563\u8bb0\u5f55\u3002\u60f3\u770b\u65b0\u7684\u5c31\u5f80\u4e0b\u7ffb\uff0c\u60f3\u627e\u65e7\u7684\u5c31\u76f4\u63a5\u641c\u3002",
    statPosts: "\u6587\u7ae0",
    statTopics: "\u5206\u7c7b",
    statTags: "\u6807\u7b7e",
    featuredEyebrow: "\u6700\u8fd1\u5728\u5199",
    featuredTitle: "\u5148\u770b\u8fd9\u51e0\u7bc7",
    featuredAction: "\u6253\u5f00",
    topicsEyebrow: "\u5e38\u770b\u5206\u7c7b",
    topicsTitle: "\u6309\u5206\u7c7b\u7ffb",
    postsEyebrow: "\u5168\u90e8\u6587\u7ae0",
    postsTitle: "\u6162\u6162\u7ffb",
    archiveEyebrow: "\u76ee\u5f55",
    archiveTitle: "\u6309\u6587\u4ef6\u5939\u7ffb",
    tagsEyebrow: "\u6807\u7b7e",
    tagsTitle: "\u5e38\u7528\u6807\u7b7e",
    recentEyebrow: "\u6700\u65b0",
    recentTitle: "\u6700\u8fd1\u66f4\u65b0",
    profileTitle: "Alee",
    profileText: "\u8fd9\u9875\u4e3b\u8981\u62ff\u6765\u653e\u81ea\u5df1\u7684\u7b14\u8bb0\u3002\u6ca1\u592a\u591a\u5e9f\u8bdd\uff0c\u5148\u80fd\u627e\u3001\u80fd\u770b\u3001\u80fd\u56de\u5934\u7ffb\u518d\u8bf4\u3002",
    sortLatest: "\u6700\u8fd1\u66f4\u65b0",
    sortTitle: "\u6807\u9898 A-Z",
    reset: "\u6e05\u7a7a",
    activeFilters: "\u5f53\u524d\u7b5b\u9009",
    emptyFilters: "\u73b0\u5728\u662f\u5168\u90e8\u5185\u5bb9",
    recentFallback: "\u6700\u8fd1\u6574\u7406",
    undated: "\u672a\u6807\u6ce8\u65e5\u671f",
    noTags: "\u8fd9\u91cc\u8fd8\u6ca1\u6709\u6807\u7b7e\u3002",
    noTopics: "\u5f53\u524d\u7b5b\u9009\u4e0b\u6ca1\u6709\u5206\u7c7b\u3002",
    noPosts: "\u8fd9\u6b21\u6ca1\u641c\u5230\uff0c\u6362\u4e2a\u8bcd\u8bd5\u8bd5\u3002",
    archiveUnavailable: "\u76ee\u5f55\u6682\u65f6\u4e0d\u53ef\u7528\u3002",
    loadFailure: "\u9996\u9875\u52a0\u8f7d\u5931\u8d25",
    loadRetry: "\u7a0d\u540e\u5237\u65b0\u518d\u8bd5",
    resultUnit: "\u7bc7\u7ed3\u679c",
    searchPrefix: "\u641c\u7d22",
    topicPrefix: "\u5206\u7c7b",
    tagPrefix: "\u6807\u7b7e",
    sortPrefix: "\u6392\u5e8f"
  };

  const state = {
    posts: [],
    tags: [],
    categories: null,
    query: "",
    selectedTopic: "",
    selectedTag: "",
    sort: "latest"
  };

  const elements = {
    totalPosts: document.getElementById("totalPosts"),
    totalTopics: document.getElementById("totalTopics"),
    totalTags: document.getElementById("totalTags"),
    searchInput: document.getElementById("searchInput"),
    sortSelect: document.getElementById("sortSelect"),
    resetFiltersBtn: document.getElementById("resetFiltersBtn"),
    activeFilters: document.getElementById("activeFilters"),
    featuredCard: document.getElementById("featuredCard"),
    featuredLink: document.getElementById("featuredLink"),
    featuredDate: document.getElementById("featuredDate"),
    featuredCategory: document.getElementById("featuredCategory"),
    featuredTitle: document.getElementById("featuredTitle"),
    featuredPath: document.getElementById("featuredPath"),
    recentList: document.getElementById("recentList"),
    topicChips: document.getElementById("topicChips"),
    postList: document.getElementById("postList"),
    resultMeta: document.getElementById("resultMeta"),
    tagCloud: document.getElementById("tagCloud"),
    recentMiniList: document.getElementById("recentMiniList"),
    vaultTree: document.getElementById("vaultTree")
  };

  function init() {
    applyStaticText();
    bindEvents();
    loadHome().catch((error) => {
      console.error(error);
      renderFailure();
    });
  }

  function applyStaticText() {
    document.title = "aleee - \u7b14\u8bb0\u5806";
    document.querySelector('meta[name="description"]').setAttribute("content", "\u5f00\u53d1\u3001\u8003\u7814\u3001\u7cfb\u7edf\u548c\u65e5\u5e38\u7b14\u8bb0\u90fd\u653e\u5728\u8fd9\u91cc\u3002");
    document.getElementById("heroEyebrow").textContent = text.heroEyebrow;
    document.getElementById("heroTitle").textContent = text.heroTitle;
    document.getElementById("heroIntro").textContent = text.heroIntro;
    document.getElementById("statPostsLabel").textContent = text.statPosts;
    document.getElementById("statTopicsLabel").textContent = text.statTopics;
    document.getElementById("statTagsLabel").textContent = text.statTags;
    document.getElementById("featuredEyebrow").textContent = text.featuredEyebrow;
    document.getElementById("featuredSectionTitle").textContent = text.featuredTitle;
    document.getElementById("featuredLink").textContent = text.featuredAction;
    document.getElementById("topicsEyebrow").textContent = text.topicsEyebrow;
    document.getElementById("topicsTitle").textContent = text.topicsTitle;
    document.getElementById("postsEyebrow").textContent = text.postsEyebrow;
    document.getElementById("postsTitle").textContent = text.postsTitle;
    document.getElementById("archiveEyebrow").textContent = text.archiveEyebrow;
    document.getElementById("archiveTitle").textContent = text.archiveTitle;
    document.getElementById("tagsEyebrow").textContent = text.tagsEyebrow;
    document.getElementById("tagsTitle").textContent = text.tagsTitle;
    document.getElementById("recentEyebrow").textContent = text.recentEyebrow;
    document.getElementById("recentTitle").textContent = text.recentTitle;
    document.getElementById("profileTitle").textContent = text.profileTitle;
    document.getElementById("profileText").textContent = text.profileText;
    document.getElementById("activeFiltersLabel").textContent = text.activeFilters;
    elements.searchInput.placeholder = text.searchPlaceholder;
    elements.sortSelect.options[0].textContent = text.sortLatest;
    elements.sortSelect.options[1].textContent = text.sortTitle;
    elements.resetFiltersBtn.textContent = text.reset;
  }

  function bindEvents() {
    elements.searchInput.addEventListener("input", (event) => {
      state.query = event.target.value.trim();
      renderFilteredView();
    });

    elements.sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      renderFilteredView();
    });

    elements.resetFiltersBtn.addEventListener("click", () => {
      state.query = "";
      state.selectedTopic = "";
      state.selectedTag = "";
      state.sort = "latest";
      elements.searchInput.value = "";
      elements.sortSelect.value = "latest";
      renderFilteredView();
    });
  }

  async function loadHome() {
    const [postsResponse, categoriesResponse, tagsResponse] = await Promise.all([
      fetch("./data/posts.json"),
      fetch("./data/categories.json"),
      fetch("./data/tags.json").catch(() => null)
    ]);

    if (!postsResponse.ok || !categoriesResponse.ok) {
      throw new Error("Failed to load homepage data");
    }

    state.posts = await postsResponse.json();
    state.categories = await categoriesResponse.json();
    state.tags = tagsResponse && tagsResponse.ok ? await tagsResponse.json() : [];

    renderStaticParts();
    renderFilteredView();
  }

  function renderStaticParts() {
    const orderedPosts = sortPostsByFreshness(state.posts);
    const featured = orderedPosts[0];
    const recent = orderedPosts.slice(1, 5);
    const latestMini = orderedPosts.slice(0, 5);
    const tags = [...state.tags].sort((a, b) => b.count - a.count).slice(0, 12);

    elements.totalPosts.textContent = String(state.posts.length);
    elements.totalTopics.textContent = String((state.categories?.children || []).filter((item) => item.name !== ".trash").length);
    elements.totalTags.textContent = String(state.tags.length);

    if (featured) {
      const href = getPostHref(featured.id);
      elements.featuredCard.href = href;
      elements.featuredLink.href = href;
      elements.featuredDate.textContent = featured.date ? formatDate(featured.date) : text.recentFallback;
      elements.featuredCategory.textContent = getPrimaryCategory(featured);
      elements.featuredTitle.textContent = featured.title;
      elements.featuredPath.textContent = featured.file;
    }

    elements.recentList.innerHTML = "";
    recent.forEach((post) => {
      const item = document.createElement("a");
      item.className = "recent-list__item";
      item.href = getPostHref(post.id);
      item.innerHTML = `
        <strong>${escapeHtml(post.title)}</strong>
        <div class="recent-list__meta">${escapeHtml(post.date ? formatDate(post.date) : post.file)}</div>
      `;
      elements.recentList.appendChild(item);
    });

    elements.tagCloud.innerHTML = "";
    if (tags.length === 0) {
      elements.tagCloud.innerHTML = `<div class="empty-state">${text.noTags}</div>`;
    } else {
      tags.forEach((tagGroup) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "tag-cloud__item";
        item.innerHTML = `
          <strong>#${escapeHtml(tagGroup.tag)}</strong>
          <span>${tagGroup.count}</span>
        `;
        item.addEventListener("click", () => {
          state.selectedTag = state.selectedTag === tagGroup.tag ? "" : tagGroup.tag;
          renderFilteredView();
        });
        elements.tagCloud.appendChild(item);
      });
    }

    elements.recentMiniList.innerHTML = "";
    latestMini.forEach((post) => {
      const item = document.createElement("a");
      item.className = "mini-list__item";
      item.href = getPostHref(post.id);
      item.innerHTML = `
        <strong>${escapeHtml(post.title)}</strong>
        <div class="mini-list__meta">${escapeHtml(post.date ? formatDate(post.date) : post.file)}</div>
      `;
      elements.recentMiniList.appendChild(item);
    });

    renderVaultTree(state.categories);
  }

  function renderFilteredView() {
    const filteredPosts = applyFilters(state.posts);
    const sortedPosts = sortPosts(filteredPosts).slice(0, 18);
    const topicEntries = getTopicEntriesFromPosts(filteredPosts, state.categories, 10);

    renderActiveFilters();
    renderTopicChips(topicEntries);
    renderPostGrid(sortedPosts, filteredPosts.length);
    syncSelectedStates();
  }

  function renderTopicChips(entries) {
    elements.topicChips.innerHTML = "";

    if (entries.length === 0) {
      elements.topicChips.innerHTML = `<div class="empty-state">${text.noTopics}</div>`;
      return;
    }

    entries.forEach((entry) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "topic-chip";
      item.innerHTML = `
        <strong>${escapeHtml(entry.name)}</strong>
        <span>${entry.count} \u7bc7</span>
      `;
      item.addEventListener("click", () => {
        state.selectedTopic = state.selectedTopic === entry.name ? "" : entry.name;
        renderFilteredView();
      });
      elements.topicChips.appendChild(item);
    });
  }

  function renderPostGrid(posts, total) {
    elements.resultMeta.textContent = `${total} ${text.resultUnit}`;
    elements.postList.innerHTML = "";

    if (posts.length === 0) {
      elements.postList.innerHTML = `<div class="empty-state">${text.noPosts}</div>`;
      return;
    }

    posts.forEach((post) => {
      const item = document.createElement("a");
      item.className = "post-grid__item";
      item.href = getPostHref(post.id);
      item.innerHTML = `
        <div class="post-grid__main">
          <strong>${escapeHtml(post.title)}</strong>
          <div class="post-grid__path">${escapeHtml(post.file)}</div>
        </div>
        <div class="post-grid__side">
          <span class="post-badge">${escapeHtml(getPrimaryCategory(post))}</span>
          <span class="post-grid__date">${escapeHtml(post.date ? formatDate(post.date) : text.undated)}</span>
        </div>
      `;
      elements.postList.appendChild(item);
    });
  }

  function renderActiveFilters() {
    elements.activeFilters.innerHTML = "";
    const chips = [];

    if (state.query) {
      chips.push(`${text.searchPrefix}: ${state.query}`);
    }
    if (state.selectedTopic) {
      chips.push(`${text.topicPrefix}: ${state.selectedTopic}`);
    }
    if (state.selectedTag) {
      chips.push(`${text.tagPrefix}: #${state.selectedTag}`);
    }
    if (state.sort === "title") {
      chips.push(`${text.sortPrefix}: ${text.sortTitle}`);
    }

    if (chips.length === 0) {
      elements.activeFilters.innerHTML = `<span class="filter-chip">${text.emptyFilters}</span>`;
      return;
    }

    chips.forEach((label) => {
      const chip = document.createElement("span");
      chip.className = "filter-chip";
      chip.textContent = label;
      elements.activeFilters.appendChild(chip);
    });
  }

  function renderVaultTree(root) {
    elements.vaultTree.innerHTML = "";

    if (!root) {
      elements.vaultTree.innerHTML = `<div class="empty-state">${text.archiveUnavailable}</div>`;
      return;
    }

    elements.vaultTree.appendChild(createCategoryNode(root, 0));
  }

  function createCategoryNode(node, depth) {
    const wrapper = document.createElement("details");
    wrapper.className = "category-node";
    wrapper.open = depth < 1;

    const summary = document.createElement("summary");
    summary.className = "category-summary";
    summary.innerHTML = `
      <span>${escapeHtml(node.name || "Root")}</span>
      <span class="category-count">${node.count}</span>
    `;
    wrapper.appendChild(summary);

    if (Array.isArray(node.posts) && node.posts.length > 0) {
      const postsGrid = document.createElement("div");
      postsGrid.className = "category-posts";
      node.posts.slice(0, 8).forEach((post) => postsGrid.appendChild(createPostCard(post)));
      wrapper.appendChild(postsGrid);
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
      const childrenGrid = document.createElement("div");
      childrenGrid.className = "category-children";
      node.children.forEach((child) => childrenGrid.appendChild(createCategoryNode(child, depth + 1)));
      wrapper.appendChild(childrenGrid);
    }

    return wrapper;
  }

  function createPostCard(post) {
    const card = document.createElement("div");
    card.className = "post-card";
    card.innerHTML = `
      <a class="post-link" href="${getPostHref(post.id)}">
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        <p class="post-path">${escapeHtml(post.file)}</p>
        <p class="post-meta">${escapeHtml(post.date ? formatDate(post.date) : text.undated)}</p>
      </a>
    `;
    return card;
  }

  function applyFilters(posts) {
    return posts.filter((post) => {
      const matchesQuery = !state.query || `${post.title} ${post.file} ${post.folder || ""}`
        .toLowerCase()
        .includes(state.query.toLowerCase());

      const matchesTopic = !state.selectedTopic || getPrimaryCategory(post) === state.selectedTopic;
      const matchesTag = !state.selectedTag || (post.tags || []).includes(state.selectedTag);

      return matchesQuery && matchesTopic && matchesTag;
    });
  }

  function sortPosts(posts) {
    if (state.sort === "title") {
      return [...posts].sort((left, right) => String(left.title).localeCompare(String(right.title), "zh-CN"));
    }

    return sortPostsByFreshness(posts);
  }

  function sortPostsByFreshness(posts) {
    return [...posts].sort((left, right) => {
      const leftDate = Date.parse(left.date || "");
      const rightDate = Date.parse(right.date || "");
      const leftHasDate = !Number.isNaN(leftDate);
      const rightHasDate = !Number.isNaN(rightDate);

      if (leftHasDate && rightHasDate && leftDate !== rightDate) {
        return rightDate - leftDate;
      }

      if (leftHasDate !== rightHasDate) {
        return leftHasDate ? -1 : 1;
      }

      return Number(right.id) - Number(left.id);
    });
  }

  function getTopicEntriesFromPosts(posts, categories, limit) {
    const counts = new Map();
    const categoryMap = new Map((categories?.children || []).map((node) => [node.name, node]));

    posts.forEach((post) => {
      const topic = getPrimaryCategory(post);
      if (!topic || topic === ".trash") {
        return;
      }
      counts.set(topic, (counts.get(topic) || 0) + 1);
    });

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, limit)
      .map(([name, count]) => ({
        ...(categoryMap.get(name) || { name, path: name }),
        count
      }));
  }

  function syncSelectedStates() {
    elements.topicChips.querySelectorAll(".topic-chip").forEach((item) => {
      const active = state.selectedTopic && item.textContent.includes(state.selectedTopic);
      item.style.borderColor = active ? "rgba(34, 77, 88, 0.26)" : "";
      item.style.background = active ? "rgba(34, 77, 88, 0.08)" : "";
    });

    elements.tagCloud.querySelectorAll(".tag-cloud__item").forEach((item) => {
      const active = state.selectedTag && item.textContent.includes(`#${state.selectedTag}`);
      item.style.borderColor = active ? "rgba(34, 77, 88, 0.26)" : "";
      item.style.background = active ? "rgba(34, 77, 88, 0.08)" : "";
    });
  }

  function getPrimaryCategory(post) {
    const segments = String(post.file || "").split("/");
    return segments[0] || "Root";
  }

  function getPostHref(id) {
    return `./post.html?id=${encodeURIComponent(id)}`;
  }

  function renderFailure() {
    elements.featuredTitle.textContent = text.loadFailure;
    elements.featuredPath.textContent = text.loadRetry;
    elements.recentList.innerHTML = `<div class="empty-state">${text.loadFailure}</div>`;
    elements.topicChips.innerHTML = `<div class="empty-state">${text.loadFailure}</div>`;
    elements.postList.innerHTML = `<div class="empty-state">${text.loadFailure}</div>`;
    elements.tagCloud.innerHTML = `<div class="empty-state">${text.loadFailure}</div>`;
    elements.recentMiniList.innerHTML = `<div class="empty-state">${text.loadFailure}</div>`;
    elements.vaultTree.innerHTML = `<div class="empty-state">${text.loadFailure}</div>`;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  init();
})();
