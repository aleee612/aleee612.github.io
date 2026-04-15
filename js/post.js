const postTitle = document.querySelector("#post-title");
const postBody = document.querySelector("#post-body");

function showError(message) {
  postTitle.textContent = "Post not found";
  postBody.textContent = message;
}

async function loadPost() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    showError("No post id was provided in the URL.");
    return;
  }

  try {
    const postsResponse = await fetch("/data/posts.json");

    if (!postsResponse.ok) {
      throw new Error(`Failed to load posts: ${postsResponse.status}`);
    }

    const posts = await postsResponse.json();
    const post = posts.find((item) => String(item.id) === id);

    if (!post) {
      showError("The requested post could not be found.");
      return;
    }

    const markdownResponse = await fetch(`/posts/${post.file}`);

    if (!markdownResponse.ok) {
      throw new Error(`Failed to load markdown: ${markdownResponse.status}`);
    }

    const markdown = await markdownResponse.text();
    const renderedHtml = marked.parse(markdown);

    postTitle.textContent = post.title;
    postBody.innerHTML = renderedHtml;
  } catch (error) {
    console.error(error);
    showError("Unable to load this post right now.");
  }
}

loadPost();
