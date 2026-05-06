(function () {
  const state = {
    posts: [],
    tags: [],
    categories: null
  };

  const elements = {
    totalPosts: document.getElementById("totalPosts"),
    totalTopics: document.getElementById("totalTopics"),
    totalTags: document.getElementById("totalTags"),
    heroPrimary: document.getElementById("heroPrimary"),
    orbitTitle: document.getElementById("orbitTitle"),
    orbitPath: document.getElementById("orbitPath"),
    orbitNotes: document.getElementById("orbitNotes"),
    featureSpotlight: document.getElementById("featureSpotlight"),
    featureMeta: document.getElementById("featureMeta"),
    featureTitle: document.getElementById("featureTitle"),
    featurePath: document.getElementById("featurePath"),
    featureStack: document.getElementById("featureStack"),
    topicGrid: document.getElementById("topicGrid"),
    latestRiver: document.getElementById("latestRiver"),
    tagCloud: document.getElementById("tagCloud"),
    vaultRail: document.getElementById("vaultRail"),
    vaultTree: document.getElementById("vaultTree")
  };

  function init() {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    loadHome().catch((error) => {
      console.error(error);
      renderFailure();
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

    renderHome();
  }

  function renderHome() {
    const posts = sortPostsByFreshness(state.posts);
    const latestPosts = posts.slice(0, 8);
    const featuredPosts = latestPosts.slice(0, 5);
    const leadPost = featuredPosts[0] || posts[0];
    const supportPosts = featuredPosts.slice(1);
    const topics = getTopicEntries(state.categories, 6);
    const hotTags = [...state.tags].sort((a, b) => b.count - a.count).slice(0, 10);

    elements.totalPosts.textContent = String(state.posts.length);
    elements.totalTopics.textContent = String(state.categories?.children?.length || 0);
    elements.totalTags.textContent = String(state.tags.length);

    if (leadPost) {
      const leadHref = `./post.html?id=${encodeURIComponent(leadPost.id)}`;
      elements.heroPrimary.href = leadHref;
      elements.orbitTitle.textContent = leadPost.title;
      elements.orbitPath.textContent = leadPost.file;
      elements.featureSpotlight.href = leadHref;
      elements.featureTitle.textContent = leadPost.title;
      elements.featurePath.textContent = leadPost.file;
      elements.featureMeta.innerHTML = `
        <span>${leadPost.date ? formatDate(leadPost.date) : "最新整理"}</span>
        <span>${(leadPost.file || "Root").split("/")[0] || "Root"}</span>
      `;
    }

    renderOrbitNotes(featuredPosts);
    renderFeatureStack(supportPosts);
    renderTopics(topics);
    renderLatest(latestPosts);
    renderTags(hotTags);
    renderVaultRail(state.categories?.children?.slice(0, 5) || []);
    renderVaultTree(state.categories);
  }

  function renderOrbitNotes(posts) {
    elements.orbitNotes.innerHTML = "";

    posts.forEach((post, index) => {
      const note = document.createElement("a");
      note.className = "orbit__note";
      note.href = `./post.html?id=${encodeURIComponent(post.id)}`;
      note.style.setProperty("--orbit-index", String(index));
      note.style.setProperty("--orbit-count", String(posts.length));
      note.innerHTML = `
        <span class="orbit__note-index">${String(index + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(post.title)}</strong>
        <span>${escapeHtml(post.date ? formatDate(post.date) : post.file)}</span>
      `;
      elements.orbitNotes.appendChild(note);
    });
  }

  function renderFeatureStack(posts) {
    elements.featureStack.innerHTML = "";

    posts.forEach((post) => {
      const item = document.createElement("a");
      item.className = "feature-stack__item";
      item.href = `./post.html?id=${encodeURIComponent(post.id)}`;
      item.innerHTML = `
        <span class="feature-stack__label">${escapeHtml(post.date ? formatDate(post.date) : "未标注日期")}</span>
        <strong>${escapeHtml(post.title)}</strong>
        <span>${escapeHtml(post.file)}</span>
      `;
      elements.featureStack.appendChild(item);
    });
  }

  function renderTopics(nodes) {
    elements.topicGrid.innerHTML = "";

    nodes.forEach((node) => {
      const representative = getRepresentativePost(node);
      const card = document.createElement("a");
      card.className = "topic-card";
      card.href = representative
        ? `./post.html?id=${encodeURIComponent(representative.id)}`
        : "#vault-browser";
      card.innerHTML = `
        <span class="topic-card__count">${node.count} 篇</span>
        <h3>${escapeHtml(node.name)}</h3>
        <p>${escapeHtml(summarizeTopic(node))}</p>
        <span class="topic-card__path">${escapeHtml(node.path)}</span>
      `;
      elements.topicGrid.appendChild(card);
    });
  }

  function renderLatest(posts) {
    elements.latestRiver.innerHTML = "";

    posts.forEach((post, index) => {
      const card = document.createElement("a");
      card.className = "latest-card";
      card.href = `./post.html?id=${encodeURIComponent(post.id)}`;
      card.innerHTML = `
        <span class="latest-card__index">${String(index + 1).padStart(2, "0")}</span>
        <div class="latest-card__content">
          <strong>${escapeHtml(post.title)}</strong>
          <p>${escapeHtml(post.file)}</p>
        </div>
        <span class="latest-card__date">${escapeHtml(post.date ? formatDate(post.date) : "未标注日期")}</span>
      `;
      elements.latestRiver.appendChild(card);
    });
  }

  function renderTags(tags) {
    elements.tagCloud.innerHTML = "";

    if (tags.length === 0) {
      elements.tagCloud.innerHTML = '<div class="empty-state">当前没有可展示的标签。</div>';
      return;
    }

    tags.forEach((tagGroup) => {
      const pill = document.createElement("div");
      pill.className = "tag-cloud__pill";
      pill.innerHTML = `
        <strong>#${escapeHtml(tagGroup.tag)}</strong>
        <span>${tagGroup.count}</span>
      `;
      elements.tagCloud.appendChild(pill);
    });
  }

  function renderVaultRail(nodes) {
    elements.vaultRail.innerHTML = "";

    nodes.forEach((node) => {
      const item = document.createElement("div");
      item.className = "vault-rail-card";
      item.innerHTML = `
        <span>${escapeHtml(node.name)}</span>
        <strong>${node.count}</strong>
      `;
      elements.vaultRail.appendChild(item);
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
      node.posts.forEach((post) => postsGrid.appendChild(createPostCard(post)));
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
      <a class="post-link" href="./post.html?id=${encodeURIComponent(post.id)}">
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        <p class="post-path">${escapeHtml(post.file)}</p>
        <p class="post-meta">${escapeHtml(post.date ? formatDate(post.date) : "未标注日期")}</p>
      </a>
    `;
    return card;
  }

  function renderFailure() {
    elements.orbitTitle.textContent = "首页加载失败";
    elements.orbitPath.textContent = "请稍后刷新重试";
    elements.featureTitle.textContent = "当前无法读取数据";
    elements.featurePath.textContent = "请检查 data/posts.json 是否可访问";
    elements.featureStack.innerHTML = '<div class="empty-state">数据载入失败。</div>';
    elements.topicGrid.innerHTML = '<div class="empty-state">专题载入失败。</div>';
    elements.latestRiver.innerHTML = '<div class="empty-state">最近更新载入失败。</div>';
    elements.tagCloud.innerHTML = '<div class="empty-state">标签载入失败。</div>';
    elements.vaultTree.innerHTML = '<div class="empty-state">目录载入失败。</div>';
  }

  function handleScroll() {
    const ratio = Math.min(window.scrollY / 1200, 1);
    document.documentElement.style.setProperty("--scroll-ratio", String(ratio));
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
      .sort((left, right) => right.count - left.count)
      .slice(0, limit);
  }

  function collectNodePosts(node) {
    const currentPosts = Array.isArray(node.posts) ? node.posts : [];
    const childPosts = Array.isArray(node.children)
      ? node.children.flatMap((child) => collectNodePosts(child))
      : [];
    return currentPosts.concat(childPosts);
  }

  function getRepresentativePost(node) {
    const candidates = collectNodePosts(node);
    return sortPostsByFreshness(candidates)[0] || null;
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
