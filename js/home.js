(function () {
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
    topicGrid: document.getElementById("topicGrid"),
    postList: document.getElementById("postList"),
    resultMeta: document.getElementById("resultMeta"),
    topicRail: document.getElementById("topicRail"),
    tagCloud: document.getElementById("tagCloud"),
    recentMiniList: document.getElementById("recentMiniList"),
    vaultTree: document.getElementById("vaultTree")
  };

  function init() {
    bindEvents();
    loadHome().catch((error) => {
      console.error(error);
      renderFailure();
    });
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

    renderStaticShell();
    renderFilteredView();
  }

  function renderStaticShell() {
    const latestPosts = sortPostsByFreshness(state.posts).slice(0, 5);
    const topics = getTopicEntries(state.categories, 6);
    const tags = [...state.tags].sort((a, b) => b.count - a.count).slice(0, 10);
    const featured = sortPostsByFreshness(state.posts)[0];

    elements.totalPosts.textContent = String(state.posts.length);
    elements.totalTopics.textContent = String(state.categories?.children?.length || 0);
    elements.totalTags.textContent = String(state.tags.length);

    if (featured) {
      const href = getPostHref(featured.id);
      elements.featuredCard.href = href;
      elements.featuredLink.href = href;
      elements.featuredDate.textContent = featured.date ? formatDate(featured.date) : "最近整理";
      elements.featuredCategory.textContent = getPrimaryCategory(featured);
      elements.featuredTitle.textContent = featured.title;
      elements.featuredPath.textContent = featured.file;
    }

    elements.topicRail.innerHTML = "";
    topics.forEach((topic) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "topic-rail__item";
      item.innerHTML = `
        <span>${topic.count} 篇</span>
        <strong>${escapeHtml(topic.name)}</strong>
      `;
      item.addEventListener("click", () => {
        state.selectedTopic = state.selectedTopic === topic.name ? "" : topic.name;
        renderFilteredView();
      });
      elements.topicRail.appendChild(item);
    });

    elements.tagCloud.innerHTML = "";
    if (tags.length === 0) {
      elements.tagCloud.innerHTML = '<div class="empty-state">当前没有标签数据。</div>';
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
    latestPosts.forEach((post) => {
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
    const topicEntries = getTopicEntriesFromPosts(filteredPosts, state.categories, 6);

    renderActiveFilters();
    renderTopicGrid(topicEntries);
    renderPostList(sortedPosts, filteredPosts.length);
    syncSideSelections();
  }

  function renderTopicGrid(entries) {
    elements.topicGrid.innerHTML = "";

    if (entries.length === 0) {
      elements.topicGrid.innerHTML = '<div class="empty-state">当前筛选下没有可展示的专题。</div>';
      return;
    }

    entries.forEach((node) => {
      const representative = getRepresentativePost(node);
      const card = document.createElement("a");
      card.className = "topic-card";
      card.href = representative ? getPostHref(representative.id) : "#vault-browser";
      card.innerHTML = `
        <span class="topic-card__count">${node.count} 篇</span>
        <h3>${escapeHtml(node.name)}</h3>
        <p>${escapeHtml(summarizeTopic(node))}</p>
        <span class="topic-card__path">${escapeHtml(node.path)}</span>
      `;
      elements.topicGrid.appendChild(card);
    });
  }

  function renderPostList(posts, total) {
    elements.resultMeta.textContent = `${total} 篇结果`;
    elements.postList.innerHTML = "";

    if (posts.length === 0) {
      elements.postList.innerHTML = '<div class="empty-state">没有找到符合当前筛选条件的文章。</div>';
      return;
    }

    posts.forEach((post) => {
      const item = document.createElement("a");
      item.className = "post-list__item";
      item.href = getPostHref(post.id);
      item.innerHTML = `
        <div class="post-list__main">
          <strong>${escapeHtml(post.title)}</strong>
          <div class="post-list__path">${escapeHtml(post.file)}</div>
        </div>
        <div class="post-list__aside">
          <span class="post-badge">${escapeHtml(getPrimaryCategory(post))}</span>
          <span class="post-list__date">${escapeHtml(post.date ? formatDate(post.date) : "未标注日期")}</span>
        </div>
      `;
      elements.postList.appendChild(item);
    });
  }

  function renderActiveFilters() {
    elements.activeFilters.innerHTML = "";
    const chips = [];

    if (state.query) {
      chips.push(`搜索: ${state.query}`);
    }
    if (state.selectedTopic) {
      chips.push(`分类: ${state.selectedTopic}`);
    }
    if (state.selectedTag) {
      chips.push(`标签: #${state.selectedTag}`);
    }
    if (state.sort === "title") {
      chips.push("排序: 标题 A-Z");
    }

    if (chips.length === 0) {
      elements.activeFilters.innerHTML = '<span class="filter-chip">未启用筛选</span>';
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
      elements.vaultTree.innerHTML = '<div class="empty-state">目录暂时不可用。</div>';
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
        <p class="post-meta">${escapeHtml(post.date ? formatDate(post.date) : "未标注日期")}</p>
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

  function getTopicEntries(categories, limit) {
    if (!categories || !Array.isArray(categories.children)) {
      return [];
    }

    return [...categories.children]
      .filter((node) => node.name !== ".trash")
      .sort((left, right) => right.count - left.count)
      .slice(0, limit);
  }

  function getTopicEntriesFromPosts(posts, categories, limit) {
    const counts = new Map();

    posts.forEach((post) => {
      const topic = getPrimaryCategory(post);
      if (!topic || topic === ".trash") {
        return;
      }
      counts.set(topic, (counts.get(topic) || 0) + 1);
    });

    const categoryMap = new Map((categories?.children || []).map((node) => [node.name, node]));
    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, limit)
      .map(([name]) => categoryMap.get(name))
      .filter(Boolean);
  }

  function syncSideSelections() {
    elements.topicRail.querySelectorAll(".topic-rail__item").forEach((item) => {
      item.style.borderColor = "";
      item.style.background = "";
      if (item.textContent.includes(state.selectedTopic)) {
        item.style.borderColor = "rgba(31, 92, 87, 0.3)";
        item.style.background = "rgba(31, 92, 87, 0.08)";
      }
    });

    elements.tagCloud.querySelectorAll(".tag-cloud__item").forEach((item) => {
      item.style.borderColor = "";
      item.style.background = "";
      if (state.selectedTag && item.textContent.includes(`#${state.selectedTag}`)) {
        item.style.borderColor = "rgba(31, 92, 87, 0.3)";
        item.style.background = "rgba(31, 92, 87, 0.08)";
      }
    });
  }

  function getRepresentativePost(node) {
    const candidates = collectNodePosts(node);
    return sortPostsByFreshness(candidates)[0] || null;
  }

  function collectNodePosts(node) {
    const currentPosts = Array.isArray(node.posts) ? node.posts : [];
    const childPosts = Array.isArray(node.children)
      ? node.children.flatMap((child) => collectNodePosts(child))
      : [];
    return currentPosts.concat(childPosts);
  }

  function summarizeTopic(node) {
    if (Array.isArray(node.children) && node.children.length > 0) {
      return node.children.slice(0, 3).map((child) => child.name).join(" · ");
    }

    if (Array.isArray(node.posts) && node.posts.length > 0) {
      return node.posts[0].title;
    }

    return "持续整理中";
  }

  function getPrimaryCategory(post) {
    const segments = String(post.file || "").split("/");
    return segments[0] || "Root";
  }

  function getPostHref(id) {
    return `./post.html?id=${encodeURIComponent(id)}`;
  }

  function renderFailure() {
    elements.featuredTitle.textContent = "首页加载失败";
    elements.featuredPath.textContent = "请稍后刷新重试";
    elements.topicGrid.innerHTML = '<div class="empty-state">专题载入失败。</div>';
    elements.postList.innerHTML = '<div class="empty-state">文章列表载入失败。</div>';
    elements.tagCloud.innerHTML = '<div class="empty-state">标签载入失败。</div>';
    elements.recentMiniList.innerHTML = '<div class="empty-state">最近文章载入失败。</div>';
    elements.vaultTree.innerHTML = '<div class="empty-state">目录载入失败。</div>';
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
