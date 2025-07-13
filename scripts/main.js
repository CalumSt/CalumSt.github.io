function parseDescriptionWithCodeBlocks(description) {
  // Regex to match --START CODE BLOCK(: lang)?-- ... --END CODE BLOCK--
  // Capture optional language after colon, default to cpp
  const codeBlockRegex = /--START CODE BLOCK(?::\s*([a-zA-Z0-9_\-]+))?--([\s\S]*?)--END CODE BLOCK--/g;

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
    parts.push(
      `<p><pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre></p>`
    );

    lastIndex = codeBlockRegex.lastIndex;
  }

  // Add any remaining text after the last code block
  const remainingText = description.substring(lastIndex).trim();
  if (remainingText) {
    parts.push(`<p>${escapeHtml(remainingText)}</p>`);
  }

  return parts.join('\n');
}

// Simple HTML escape helper
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


function generateBlogEntries(posts, containerSelector) {
  const $container = $(containerSelector);

  if (!$container.length) {
    console.warn('Container not found:', containerSelector);
    return;
  }

  posts.forEach(post => {
    const href = `/${post.filename.replace(/^\/?/, '')}/`;

    // Use the improved parser to handle multiple code blocks & language detection
    const parsedDescriptionHtml = parseDescriptionWithCodeBlocks(post["brief description"] || '');

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

    // Call Prism to highlight dynamically added code blocks
  Prism.highlightAll();
}