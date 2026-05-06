import React from "react";
import ReactDOM from "react-dom/client";
import { marked } from "marked";
import "./styles.css";

const baseUrl = import.meta.env.BASE_URL;

function formatDate(dateString, locale = "zh-CN") {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

function sortPostsByFreshness(posts) {
  return [...posts].sort((left, right) => {
    const leftDate = Date.parse(left.date ?? "");
    const rightDate = Date.parse(right.date ?? "");
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

function getLatestPosts(posts, limit) {
  return sortPostsByFreshness(posts).slice(0, limit);
}

function collectNodePosts(node) {
  const currentPosts = node.posts ?? [];
  const childPosts = (node.children ?? []).flatMap((child) => collectNodePosts(child));
  return currentPosts.concat(childPosts);
}

function getRepresentativePost(node) {
  const candidates = collectNodePosts(node);
  return sortPostsByFreshness(candidates)[0] ?? null;
}

function summarizeTopic(node) {
  if ((node.children ?? []).length > 0) {
    return node.children
      .slice(0, 3)
      .map((child) => child.name)
      .join(" · ");
  }

  if ((node.posts ?? []).length > 0) {
    return node.posts[0].title;
  }

  return "持续整理中";
}

function getTopicEntries(categories, limit = 6) {
  if (!categories?.children?.length) {
    return [];
  }

  return [...categories.children]
    .sort((left, right) => right.count - left.count)
    .slice(0, limit);
}

function Shell({ eyebrow, title, intro, children, mainClassName = "" }) {
  return (
    <>
      <header className="site-header">
        <div className="container">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {intro ? <p className="intro">{intro}</p> : null}
        </div>
      </header>

      <main className={`container ${mainClassName}`.trim()}>{children}</main>
    </>
  );
}

function LoadingCard({ message }) {
  return <div className="post-card muted">{message}</div>;
}

function SectionLead({ eyebrow, title, description, action }) {
  return (
    <div className="section-lead">
      <div>
        <p className="section-lead__eyebrow">{eyebrow}</p>
        <h2 className="section-lead__title">{title}</h2>
      </div>
      <div className="section-lead__aside">
        <p>{description}</p>
        {action}
      </div>
    </div>
  );
}

function PostLinkCard({ post }) {
  return (
    <div className="post-card" key={post.id}>
      <a
        className="post-link"
        href={`${baseUrl}post.html?id=${encodeURIComponent(post.id)}`}
      >
        <h3 className="post-title">{post.title}</h3>
        <p className="post-path">{post.file}</p>
        <p className="post-meta">
          {post.date ? formatDate(post.date) : "未标注日期"}
        </p>
      </a>
    </div>
  );
}

function CategoryNode({ node, depth = 0 }) {
  const openByDefault = depth < 1;

  return (
    <details className="category-node" open={openByDefault}>
      <summary className="category-summary">
        <span>{node.name || "Root"}</span>
        <span className="category-count">{node.count}</span>
      </summary>

      {node.posts.length > 0 ? (
        <div className="category-posts">
          {node.posts.map((post) => (
            <PostLinkCard key={post.id} post={post} />
          ))}
        </div>
      ) : null}

      {node.children.length > 0 ? (
        <div className="category-children">
          {node.children.map((child) => (
            <CategoryNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </details>
  );
}

function HomePage({ posts, tags, categories, status }) {
  const [scrollRatio, setScrollRatio] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const nextRatio = Math.min(window.scrollY / 1200, 1);
      setScrollRatio(nextRatio);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (status === "loading") {
    return (
      <Shell
        eyebrow="Vault Loading"
        title="正在整理首页"
        intro="内容索引正在加载，稍后会显示精选文章与专题入口。"
      >
        <LoadingCard message="Loading posts..." />
      </Shell>
    );
  }

  if (status === "error") {
    return (
      <Shell
        eyebrow="Vault Error"
        title="首页暂时不可用"
        intro="数据索引没有正常返回，请稍后刷新重试。"
      >
        <LoadingCard message="Unable to load posts right now." />
      </Shell>
    );
  }

  if (posts.length === 0) {
    return (
      <Shell
        eyebrow="Empty Vault"
        title="还没有可展示的文章"
        intro="等内容同步完成后，这里会生成新的首页。"
      >
        <LoadingCard message="No posts available yet." />
      </Shell>
    );
  }

  const latestPosts = getLatestPosts(posts, 8);
  const featuredPosts = latestPosts.slice(0, 5);
  const leadPost = featuredPosts[0] ?? latestPosts[0];
  const supportPosts = featuredPosts.slice(1, 5);
  const orbitPosts = featuredPosts.length > 0 ? featuredPosts : latestPosts.slice(0, 5);
  const topicEntries = getTopicEntries(categories, 6);
  const highlightedTags = [...tags]
    .sort((left, right) => right.count - left.count)
    .slice(0, 10);
  const categoryRoots = categories?.children?.slice(0, 5) ?? [];

  return (
    <div className="home-page" style={{ "--scroll-ratio": scrollRatio }}>
      <div className="home-shell">
        <header className="home-hero">
          <div className="home-hero__copy">
            <p className="home-kicker">ALEEE VAULT</p>
            <h1 className="home-title">把笔记做成可以逛、可以读、也可以回看的首页。</h1>
            <p className="home-lead">
              这里不只是 Obsidian 的文件出口，而是一个更像杂志封面的入口。
              先看到最新值得读的内容，再按专题进入整个知识库。
            </p>

            <div className="hero-actions">
              <a
                className="hero-button hero-button--primary"
                href={`${baseUrl}post.html?id=${encodeURIComponent(leadPost.id)}`}
              >
                从最新文章开始
              </a>
              <a className="hero-button hero-button--secondary" href="#vault-browser">
                浏览完整目录
              </a>
            </div>

            <div className="signal-grid">
              <div className="signal-card">
                <span className="signal-card__label">文章总数</span>
                <strong className="signal-card__value">{posts.length}</strong>
              </div>
              <div className="signal-card">
                <span className="signal-card__label">专题数量</span>
                <strong className="signal-card__value">{categories?.children?.length ?? 0}</strong>
              </div>
              <div className="signal-card">
                <span className="signal-card__label">标签分组</span>
                <strong className="signal-card__value">{tags.length}</strong>
              </div>
            </div>
          </div>

          <div className="hero-orbit">
            <div className="hero-orbit__halo"></div>
            <div className="hero-orbit__ring hero-orbit__ring--outer"></div>
            <div className="hero-orbit__ring hero-orbit__ring--inner"></div>

            <div className="hero-orbit__core">
              <span className="hero-orbit__badge">Latest Dispatch</span>
              <h2>{leadPost.title}</h2>
              <p>{leadPost.file}</p>
            </div>

            {orbitPosts.map((post, index) => (
              <a
                className="orbit-note"
                href={`${baseUrl}post.html?id=${encodeURIComponent(post.id)}`}
                key={`orbit-${post.id}`}
                style={{
                  "--orbit-index": index,
                  "--orbit-count": orbitPosts.length
                }}
              >
                <span className="orbit-note__index">{String(index + 1).padStart(2, "0")}</span>
                <strong>{post.title}</strong>
                <span>{post.date ? formatDate(post.date) : post.file}</span>
              </a>
            ))}
          </div>
        </header>

        <main className="home-main">
          <section className="home-section">
            <SectionLead
              eyebrow="Featured"
              title="先读这几篇"
              description="首页首先解决“我现在该看什么”，不是把所有目录一次性堆给你。"
            />

            <div className="featured-layout">
              <a
                className="feature-spotlight"
                href={`${baseUrl}post.html?id=${encodeURIComponent(leadPost.id)}`}
              >
                <div className="feature-spotlight__meta">
                  <span>{leadPost.date ? formatDate(leadPost.date) : "最新整理"}</span>
                  <span>{leadPost.file.split("/")[0] || "Root"}</span>
                </div>
                <h3>{leadPost.title}</h3>
                <p>{leadPost.file}</p>
              </a>

              <div className="feature-stack">
                {supportPosts.map((post) => (
                  <a
                    className="feature-stack__item"
                    href={`${baseUrl}post.html?id=${encodeURIComponent(post.id)}`}
                    key={`featured-${post.id}`}
                  >
                    <span className="feature-stack__label">
                      {post.date ? formatDate(post.date) : "未标注日期"}
                    </span>
                    <strong>{post.title}</strong>
                    <span>{post.file}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section className="home-section">
            <SectionLead
              eyebrow="Topics"
              title="按专题进入"
              description="把整个 Vault 先折叠成几个可记住的入口，而不是默认文件树。"
            />

            <div className="topic-grid">
              {topicEntries.map((node) => {
                const representativePost = getRepresentativePost(node);

                return (
                  <a
                    className="topic-card"
                    href={
                      representativePost
                        ? `${baseUrl}post.html?id=${encodeURIComponent(representativePost.id)}`
                        : "#vault-browser"
                    }
                    key={node.path}
                  >
                    <span className="topic-card__count">{node.count} 篇</span>
                    <h3>{node.name}</h3>
                    <p>{summarizeTopic(node)}</p>
                    <span className="topic-card__path">{node.path}</span>
                  </a>
                );
              })}
            </div>
          </section>

          <section className="home-section">
            <SectionLead
              eyebrow="Recent"
              title="最近更新"
              description="保留时间感，让首页像持续滚动的笔记流，而不是一次性归档。"
            />

            <div className="latest-river">
              {latestPosts.map((post, index) => (
                <a
                  className="latest-card"
                  href={`${baseUrl}post.html?id=${encodeURIComponent(post.id)}`}
                  key={`latest-${post.id}`}
                >
                  <span className="latest-card__index">{String(index + 1).padStart(2, "0")}</span>
                  <div className="latest-card__content">
                    <strong>{post.title}</strong>
                    <p>{post.file}</p>
                  </div>
                  <span className="latest-card__date">
                    {post.date ? formatDate(post.date) : "未标注日期"}
                  </span>
                </a>
              ))}
            </div>
          </section>

          <section className="home-section">
            <SectionLead
              eyebrow="Signals"
              title="高频标签"
              description="如果你已经知道自己要找哪类内容，可以直接从标签密度切进去。"
            />

            <div className="tag-cloud">
              {highlightedTags.map((tagGroup) => (
                <div className="tag-cloud__pill" key={tagGroup.tag}>
                  <strong>#{tagGroup.tag}</strong>
                  <span>{tagGroup.count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="home-section vault-browser" id="vault-browser">
            <SectionLead
              eyebrow="Archive"
              title="完整目录"
              description="完整树结构仍然保留，但降级为真正需要时再展开的浏览器。"
              action={<span className="vault-browser__hint">点击各栏目查看全部文章</span>}
            />

            <div className="vault-browser__grid">
              <div className="vault-browser__rail">
                {categoryRoots.map((node) => (
                  <div className="vault-rail-card" key={`rail-${node.path}`}>
                    <span>{node.name}</span>
                    <strong>{node.count}</strong>
                  </div>
                ))}
              </div>

              <div className="vault-browser__tree">
                {categories ? (
                  <CategoryNode node={categories} />
                ) : (
                  <LoadingCard message="No categories available." />
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function PostPage({ state }) {
  let title = "文章加载中...";
  let body = <p className="muted">正在加载内容...</p>;

  if (state.status === "error") {
    title = "文章不存在";
    body = <p className="muted">{state.message}</p>;
  }

  if (state.status === "ready") {
    title = state.post.title;
    body = (
      <>
        <p className="post-meta">{state.post.date ? formatDate(state.post.date) : "未标注日期"}</p>
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: marked.parse(state.markdown) }}
        />
      </>
    );
  }

  return (
    <Shell
      eyebrow="Article"
      title={title}
      intro={<a className="back-link" href={`${baseUrl}index.html`}>返回首页</a>}
      mainClassName="post-main"
    >
      <article className="post-card post-content post-article-frame">{body}</article>
    </Shell>
  );
}

function App() {
  const isPostPage = window.location.pathname.endsWith("/post.html") || window.location.pathname.endsWith("post.html");
  const [posts, setPosts] = React.useState([]);
  const [tags, setTags] = React.useState([]);
  const [categories, setCategories] = React.useState(null);
  const [postsStatus, setPostsStatus] = React.useState("loading");
  const [postState, setPostState] = React.useState({ status: "loading", message: "" });

  React.useEffect(() => {
    if (!isPostPage) {
      const loadPosts = async () => {
        try {
          const [postsResponse, tagsResponse, categoriesResponse] = await Promise.all([
            fetch(`${baseUrl}data/posts.json`),
            fetch(`${baseUrl}data/tags.json`),
            fetch(`${baseUrl}data/categories.json`)
          ]);

          if (!postsResponse.ok) {
            throw new Error(`Failed to load posts: ${postsResponse.status}`);
          }

          if (!tagsResponse.ok) {
            throw new Error(`Failed to load tags: ${tagsResponse.status}`);
          }

          if (!categoriesResponse.ok) {
            throw new Error(`Failed to load categories: ${categoriesResponse.status}`);
          }

          const [postsData, tagsData, categoriesData] = await Promise.all([
            postsResponse.json(),
            tagsResponse.json(),
            categoriesResponse.json()
          ]);

          setPosts(postsData);
          setTags(tagsData);
          setCategories(categoriesData);
          setPostsStatus("ready");
        } catch (error) {
          console.error(error);
          setPostsStatus("error");
        }
      };

      loadPosts();
      return;
    }

    const loadPost = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");

      if (!id) {
        setPostState({ status: "error", message: "URL 中缺少文章 id。" });
        return;
      }

      try {
        const postsResponse = await fetch(`${baseUrl}data/posts.json`);

        if (!postsResponse.ok) {
          throw new Error(`Failed to load posts: ${postsResponse.status}`);
        }

        const allPosts = await postsResponse.json();
        const post = allPosts.find((item) => String(item.id) === id);

        if (!post) {
          setPostState({ status: "error", message: "没有找到对应文章。" });
          return;
        }

        const markdownResponse = await fetch(`${baseUrl}posts/${post.file}`);

        if (!markdownResponse.ok) {
          throw new Error(`Failed to load markdown: ${markdownResponse.status}`);
        }

        const markdown = await markdownResponse.text();
        setPostState({ status: "ready", post, markdown });
      } catch (error) {
        console.error(error);
        setPostState({ status: "error", message: "文章内容暂时无法加载。" });
      }
    };

    loadPost();
  }, [isPostPage]);

  if (isPostPage) {
    return <PostPage state={postState} />;
  }

  return <HomePage posts={posts} tags={tags} categories={categories} status={postsStatus} />;
}

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
