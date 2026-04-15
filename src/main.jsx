import React from "react";
import ReactDOM from "react-dom/client";
import { marked } from "marked";
import "./styles.css";

const baseUrl = import.meta.env.BASE_URL;

function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

function Shell({ eyebrow, title, intro, children }) {
  return (
    <>
      <header className="site-header">
        <div className="container">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {intro ? <p className="intro">{intro}</p> : null}
        </div>
      </header>

      <main className="container">{children}</main>
    </>
  );
}

function LoadingCard({ message }) {
  return <div className="post-card muted">{message}</div>;
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
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
          {post.date ? formatDate(post.date) : "No date"}
        </p>
      </a>
    </div>
  );
}

function CategoryNode({ node, depth = 0 }) {
  const openByDefault = depth < 2;

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
  let content;

  if (status === "loading") {
    content = <LoadingCard message="Loading posts..." />;
  } else if (status === "error") {
    content = <LoadingCard message="Unable to load posts right now." />;
  } else if (posts.length === 0) {
    content = <LoadingCard message="No posts available yet." />;
  } else {
    content = (
      <>
        <section>
          <SectionTitle
            title="Overview"
            subtitle={`Showing ${posts.length} notes from your Obsidian Vault.`}
          />
          <div className="stats-grid">
            <div className="post-card stat-card">
              <span className="stat-label">Notes</span>
              <strong className="stat-value">{posts.length}</strong>
            </div>
            <div className="post-card stat-card">
              <span className="stat-label">Tag Groups</span>
              <strong className="stat-value">{tags.length}</strong>
            </div>
            <div className="post-card stat-card">
              <span className="stat-label">Top Categories</span>
              <strong className="stat-value">{categories?.children?.length ?? 0}</strong>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle
            title="Automatic Categories"
            subtitle="Notes are grouped by their folder structure, so the whole vault stays browseable even without frontmatter tags."
          />
          {categories ? <CategoryNode node={categories} /> : <LoadingCard message="No categories available." />}
        </section>

        <section>
          <SectionTitle
            title="Tagged Notes"
            subtitle={tags.length > 0 ? "Notes with frontmatter tags." : "No frontmatter tags found yet."}
          />
          {tags.length > 0 ? (
            <div className="tag-groups">
              {tags.map((tagGroup) => (
                <section className="post-card tag-card" key={tagGroup.tag}>
                  <div className="tag-header">
                    <h3 className="tag-title">#{tagGroup.tag}</h3>
                    <span className="category-count">{tagGroup.count}</span>
                  </div>
                  <div className="tag-posts">
                    {tagGroup.posts.map((post) => (
                      <a
                        className="tag-post-link"
                        href={`${baseUrl}post.html?id=${encodeURIComponent(post.id)}`}
                        key={`${tagGroup.tag}-${post.id}`}
                      >
                        <span>{post.title}</span>
                        <span className="post-path">{post.file}</span>
                      </a>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <LoadingCard message="No tags were extracted from frontmatter." />
          )}
        </section>
      </>
    );
  }

  return (
    <Shell
      eyebrow="Simple Writing Space"
      title="Obsidian Vault on the Web"
      intro="All markdown notes are published from your vault, copied into the site, and grouped automatically."
    >
      {content}
    </Shell>
  );
}

function PostPage({ state }) {
  let title = "Loading post...";
  let body = <p className="muted">Loading content...</p>;

  if (state.status === "error") {
    title = "Post not found";
    body = <p className="muted">{state.message}</p>;
  }

  if (state.status === "ready") {
    title = state.post.title;
    body = (
      <>
        <p className="post-meta">{formatDate(state.post.date)}</p>
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: marked.parse(state.markdown) }}
        />
      </>
    );
  }

  return (
    <Shell
      eyebrow="Blog Post"
      title={title}
      intro={<a className="back-link" href={`${baseUrl}index.html`}>Back to all posts</a>}
    >
      <article className="post-card post-content">{body}</article>
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
        setPostState({ status: "error", message: "No post id was provided in the URL." });
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
          setPostState({ status: "error", message: "The requested post could not be found." });
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
        setPostState({ status: "error", message: "Unable to load this post right now." });
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
