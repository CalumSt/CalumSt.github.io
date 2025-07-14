function parseDescriptionWithCodeBlocks(description) {
  // Regex to match --START CODE BLOCK(: lang)?-- ... --END CODE BLOCK--
  // Capture optional language after colon, default to cpp
  const codeBlockRegex =
      /--START CODE BLOCK(?::\s*([a-zA-Z0-9_\-]+))?--([\s\S]*?)--END CODE BLOCK--/g;

  let parts = [];
  let lastIndex = 0;

  let match;
  while ((match = codeBlockRegex.exec(description)) !== null) {
    const lang = match[1] ? match[1].toLowerCase() : 'cpp';
    const code = match[2];

    // Add text before code block as a paragraph if non-empty
    const textBefore = description.substring(lastIndex, match.index).trim();
    if (textBefore) {
      parts.push(`<p>${escapeHtml(textBefore)}</p>`);
    }

    // Add code block with detected language
    parts.push(`<pre><code class="language-${lang}">${
        escapeHtml(code.trim())}</code></pre>`);

    lastIndex = codeBlockRegex.lastIndex;
  }

  // Add any remaining text after the last code block
  const remainingText = description.substring(lastIndex).trim();
  if (remainingText) {
    parts.push(`<p>${escapeHtml(remainingText)}</p>`);
  }

  return parts.join('\n');
}
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}


// Simple HTML escape helper
function escapeHtml(text) {
  return text.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
}

function generatePaginationControls(
    $paginationContainer, currentPage, totalPages) {
  $paginationContainer.empty();

  if (totalPages <= 1) return;

  if (currentPage > 1) {
    $paginationContainer.append(
        `<a href="#" class="prev" data-page="${currentPage - 1}">Newer</a>`);
  }

  $paginationContainer.append(
      `<span class="page_number">Page: ${currentPage} of ${totalPages}</span>`);

  if (currentPage < totalPages) {
    $paginationContainer.append(
        `<a href="#" class="next" data-page="${currentPage + 1}">Older</a>`);
  }
}

function generateBlogEntries(
    posts, containerSelector, page = 1, category = null, postsPerPage = 10) {
  const $container = $(containerSelector);
  if (!$container.length) {
    console.warn('Container not found:', containerSelector);
    return;
  }

  $container.find('article').remove();  // Clear previous posts

  // Apply category filter if specified
  let filteredPosts = category ?
      posts.filter(
          post =>
              (post.category || '').toLowerCase() === category.toLowerCase()) :
      posts;

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Render blog posts
  currentPosts.forEach(post => {
    const filename = post.filename.replace(/^\/?/, '');
    const href = filename.endsWith('.html') ? `/${filename}` : `/${filename}/`;
    const parsedDescriptionHtml =
        parseDescriptionWithCodeBlocks(post['brief description'] || '');

    const $article = $(`
      <article>
        <div class="article-container">
          <div class="meta-container">
            <header>
              <a href="${href}">
                <h2 class="entry-title">${post.title}</h2>
              </a>
            </header>
          </div>
          <div class="content-container">
            ${parsedDescriptionHtml}
            <p><a href="${href}">Read on →</a></p>
          </div>
          <footer></footer>
        </div>
      </article>
    `);

    $container.append($article);
  });

  const $pagination = $container.find('.pagination');
  generatePaginationControls($pagination, page, totalPages);

  Prism.highlightAll();
}
