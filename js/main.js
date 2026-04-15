const postList = document.querySelector("#post-list");

async function loadPosts() {
  try {
    const response = await fetch("/data/posts.json");

    if (!response.ok) {
      throw new Error(`Failed to load posts: ${response.status}`);
    }

    const posts = await response.json();
    postList.innerHTML = "";

    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className = "post-card";

      const link = document.createElement("a");
      link.className = "post-link";
      link.href = `/post.html?id=${encodeURIComponent(post.id)}`;

      const title = document.createElement("h3");
      title.className = "post-title";
      title.textContent = post.title;

      const date = document.createElement("p");
      date.className = "post-meta";
      date.textContent = post.date;

      link.append(title, date);
      card.appendChild(link);
      postList.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    postList.innerHTML = '<div class="post-card muted">Unable to load posts right now.</div>';
  }
}

loadPosts();
