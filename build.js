import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const sourceRoot = "D:/Obsidian Vault";
const postsOutputRoot = "D:/my-blog/public/posts";
const dataOutputRoot = "D:/my-blog/public/data";
const ignoredDirectories = new Set([".git", ".obsidian", ".smart-env", "node_modules"]);
const maxPublishedPdfSizeBytes = 50 * 1024 * 1024;

function toForwardSlash(value) {
  return value.split(path.sep).join("/");
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeAliases(aliases) {
  if (Array.isArray(aliases)) {
    return aliases.map((alias) => String(alias).trim()).filter(Boolean);
  }

  if (typeof aliases === "string") {
    return aliases
      .split(",")
      .map((alias) => alias.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeDate(value) {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return String(value);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function emptyDir(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
  await ensureDir(dirPath);
}

async function collectMarkdownFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }
      files.push(...(await collectMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".md") {
      files.push(fullPath);
    }
  }

  return files;
}

async function collectAssetFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }
      files.push(...(await collectAssetFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && path.extname(entry.name) && path.extname(entry.name).toLowerCase() !== ".md") {
      files.push(fullPath);
    }
  }

  return files;
}

async function shouldPublishAsset(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension !== ".pdf") {
    return true;
  }

  const stat = await fs.stat(filePath);

  if (stat.size <= maxPublishedPdfSizeBytes) {
    return true;
  }

  console.log(
    `[build] Skipping oversized PDF: ${toForwardSlash(filePath)} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`
  );

  return false;
}

function buildCategoryTree(posts) {
  const root = {
    name: "All Notes",
    path: "",
    count: posts.length,
    posts: [],
    children: []
  };

  const nodeMap = new Map([[root.path, root]]);

  for (const post of posts) {
    const segments = post.file.split("/");
    const folderSegments = segments.slice(0, -1);

    if (folderSegments.length === 0) {
      root.posts.push({
        id: post.id,
        title: post.title,
        date: post.date,
        file: post.file
      });
      continue;
    }

    let currentPath = "";

    for (const segment of folderSegments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      if (!nodeMap.has(currentPath)) {
        const parentPath = currentPath.includes("/")
          ? currentPath.slice(0, currentPath.lastIndexOf("/"))
          : "";
        const parent = nodeMap.get(parentPath) ?? root;
        const node = {
          name: segment,
          path: currentPath,
          count: 0,
          posts: [],
          children: []
        };

        parent.children.push(node);
        nodeMap.set(currentPath, node);
      }
    }

    const leafNode = nodeMap.get(currentPath) ?? root;
    leafNode.posts.push({
      id: post.id,
      title: post.title,
      date: post.date,
      file: post.file
    });
  }

  function finalizeNode(node) {
    node.children.sort((left, right) => left.name.localeCompare(right.name));
    node.posts.sort((left, right) => left.file.localeCompare(right.file));

    let total = node.posts.length;

    for (const child of node.children) {
      total += finalizeNode(child);
    }

    node.count = total;
    return total;
  }

  finalizeNode(root);
  return root;
}

async function buildContent() {
  console.log(`[build] Scanning markdown files in ${sourceRoot}`);

  const sourceStat = await fs.stat(sourceRoot).catch(() => null);

  if (!sourceStat?.isDirectory()) {
    throw new Error(`Source directory not found: ${sourceRoot}`);
  }

  await emptyDir(postsOutputRoot);
  await ensureDir(dataOutputRoot);

  const markdownFiles = await collectMarkdownFiles(sourceRoot);
  const assetFiles = await collectAssetFiles(sourceRoot);
  markdownFiles.sort((a, b) => a.localeCompare(b));
  assetFiles.sort((a, b) => a.localeCompare(b));

  console.log(`[build] Found ${markdownFiles.length} markdown file(s)`);
  console.log(`[build] Found ${assetFiles.length} asset file(s)`);

  const posts = [];
  const assets = [];

  for (const [index, filePath] of markdownFiles.entries()) {
    const relativePath = path.relative(sourceRoot, filePath);
    const outputRelativePath = toForwardSlash(relativePath);
    const outputPath = path.join(postsOutputRoot, relativePath);
    const fileName = path.basename(filePath, ".md");
    const folderPath = path.dirname(outputRelativePath) === "." ? "" : toForwardSlash(path.dirname(relativePath));
    const folders = folderPath ? folderPath.split("/") : [];

    console.log(`[build] Processing ${index + 1}/${markdownFiles.length}: ${outputRelativePath}`);

    const rawContent = await fs.readFile(filePath, "utf8");
    const { data } = matter(rawContent);

    await ensureDir(path.dirname(outputPath));
    await fs.copyFile(filePath, outputPath);

    const post = {
      id: index + 1,
      title: data.title ? String(data.title) : fileName,
      summary: data.summary ? String(data.summary) : data.description ? String(data.description) : undefined,
      tags: normalizeTags(data.tags),
      aliases: normalizeAliases(data.aliases ?? data.alias),
      basename: fileName,
      file: outputRelativePath,
      folder: folderPath,
      folders
    };

    const date = normalizeDate(data.date);

    if (date) {
      post.date = date;
    }

    posts.push(post);
  }

  for (const [index, filePath] of assetFiles.entries()) {
    if (!(await shouldPublishAsset(filePath))) {
      continue;
    }

    const relativePath = path.relative(sourceRoot, filePath);
    const outputRelativePath = toForwardSlash(relativePath);
    const outputPath = path.join(postsOutputRoot, relativePath);
    const extension = path.extname(filePath);
    const fileName = path.basename(filePath);
    const baseName = path.basename(filePath, extension);
    const folderPath = path.dirname(outputRelativePath) === "." ? "" : toForwardSlash(path.dirname(relativePath));

    console.log(`[build] Copying asset ${index + 1}/${assetFiles.length}: ${outputRelativePath}`);

    await ensureDir(path.dirname(outputPath));
    await fs.copyFile(filePath, outputPath);

    assets.push({
      name: fileName,
      basename: baseName,
      ext: extension.toLowerCase(),
      file: outputRelativePath,
      folder: folderPath
    });
  }

  const tagsMap = new Map();

  for (const post of posts) {
    for (const tag of post.tags) {
      const entry = tagsMap.get(tag) ?? [];
      entry.push({
        id: post.id,
        title: post.title,
        date: post.date,
        file: post.file
      });
      tagsMap.set(tag, entry);
    }
  }

  const tags = Array.from(tagsMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([tag, taggedPosts]) => ({
      tag,
      count: taggedPosts.length,
      posts: taggedPosts
    }));

  const categories = buildCategoryTree(posts);

  const postsJsonPath = path.join(dataOutputRoot, "posts.json");
  const tagsJsonPath = path.join(dataOutputRoot, "tags.json");
  const categoriesJsonPath = path.join(dataOutputRoot, "categories.json");
  const assetsJsonPath = path.join(dataOutputRoot, "assets.json");

  await fs.writeFile(postsJsonPath, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
  await fs.writeFile(tagsJsonPath, `${JSON.stringify(tags, null, 2)}\n`, "utf8");
  await fs.writeFile(categoriesJsonPath, `${JSON.stringify(categories, null, 2)}\n`, "utf8");
  await fs.writeFile(assetsJsonPath, `${JSON.stringify(assets, null, 2)}\n`, "utf8");

  console.log(`[build] Wrote ${toForwardSlash(postsJsonPath)}`);
  console.log(`[build] Wrote ${toForwardSlash(tagsJsonPath)}`);
  console.log(`[build] Wrote ${toForwardSlash(categoriesJsonPath)}`);
  console.log(`[build] Wrote ${toForwardSlash(assetsJsonPath)}`);
  console.log("[build] Done");
}

buildContent().catch((error) => {
  console.error(`[build] Error: ${error.message}`);
  process.exitCode = 1;
});
