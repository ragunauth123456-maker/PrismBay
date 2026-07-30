/**
 * Migration script: Extract bodyHtml from articles.ts into per-article files.
 *
 * Handles both backtick-template (`...`) and double-quoted ("...") bodyHtml strings.
 *
 * Usage: bun run scripts/split-articles.ts
 */

import * as fs from "fs";
import * as path from "path";

const ARTICLES_DIR = path.join(import.meta.dir, "..", "src", "data", "articles");
const ARTICLES_TS_PATH = path.join(import.meta.dir, "..", "src", "data", "articles.ts");

fs.mkdirSync(ARTICLES_DIR, { recursive: true });

const source = fs.readFileSync(ARTICLES_TS_PATH, "utf-8");

// Find all article slugs and their positions
const slugRegex = /slug:\s*"([a-z0-9-]+)"/g;
const articlePositions: { slug: string; slugStart: number }[] = [];
let match: RegExpExecArray | null;
while ((match = slugRegex.exec(source)) !== null) {
  articlePositions.push({ slug: match[1], slugStart: match.index });
}

console.log(`Found ${articlePositions.length} article slugs`);

let filesCreated = 0;
let totalHtmlSize = 0;
let modifiedSource = source;

// Process in reverse order so indices don't shift
for (let i = articlePositions.length - 1; i >= 0; i--) {
  const { slug, slugStart } = articlePositions[i];

  // Find bodyHtml for this article
  const nextArticleIdx = i + 1 < articlePositions.length ? articlePositions[i + 1].slugStart : source.length;
  const searchRegion = source.substring(slugStart, nextArticleIdx);

  const bodyHtmlIdx = searchRegion.indexOf("bodyHtml:");
  if (bodyHtmlIdx === -1) continue;

  const afterKeyword = searchRegion.substring(bodyHtmlIdx + "bodyHtml:".length);

  // Determine quote style: backtick or double-quote
  // Skip whitespace
  let wsEnd = 0;
  while (wsEnd < afterKeyword.length && (afterKeyword[wsEnd] === " " || afterKeyword[wsEnd] === "\t")) {
    wsEnd++;
  }
  if (wsEnd >= afterKeyword.length) continue;

  const quoteChar = afterKeyword[wsEnd];
  if (quoteChar !== "`" && quoteChar !== '"') {
    console.warn(`  ⚠️  Unexpected quote char '${quoteChar}' for ${slug}, skipping`);
    continue;
  }

  const bodyStart = slugStart + bodyHtmlIdx + "bodyHtml:".length + wsEnd + 1;

  // Find the closing quote. For backticks, handle escape sequences.
  // For double quotes, strings use \\n for newlines and \\" for escaped quotes.
  let bodyEnd = bodyStart;
  if (quoteChar === "`") {
    // Backtick template literal
    let depth = 1;
    for (let j = bodyStart; j < source.length && depth > 0; j++) {
      const ch = source[j];
      if (ch === "\\") {
        j++; // skip escaped char
        continue;
      }
      if (ch === "`") {
        depth--;
        if (depth === 0) { bodyEnd = j; break; }
      }
    }
    if (depth > 0) {
      console.warn(`  ⚠️  Unclosed backtick for ${slug}, skipping`);
      continue;
    }
  } else {
    // Double-quoted string: find unescaped closing "
    for (let j = bodyStart; j < source.length; j++) {
      const ch = source[j];
      if (ch === "\\") {
        j++; // skip escaped char
        continue;
      }
      if (ch === '"') {
        bodyEnd = j;
        break;
      }
    }
  }

  let bodyHtml = source.substring(bodyStart, bodyEnd);

  // Write the per-article file (always use backtick template for output)
  const filePath = path.join(ARTICLES_DIR, `${slug}.ts`);
  const escaped = bodyHtml
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  const content = `// Auto-generated body HTML for article: ${slug}
// Source: src/data/articles.ts migration — do not edit here; edit the source.

export const bodyHtml = \`${escaped}\`;
`;

  fs.writeFileSync(filePath, content, "utf-8");
  filesCreated++;
  totalHtmlSize += bodyHtml.length;

  console.log(`  ✅ Created articles/${slug}.ts (${bodyHtml.length.toLocaleString()} bytes, quote=${quoteChar})`);

  // Replace bodyHtml in source with bodyHtmlFile
  const replaceStart = slugStart + bodyHtmlIdx;
  // bodyEnd is the position of the closing quote. We need to replace through the closing quote.
  let replaceEnd = bodyEnd + 1;
  // Skip optional whitespace and comma after the closing quote
  while (replaceEnd < modifiedSource.length &&
    (modifiedSource[replaceEnd] === " " || modifiedSource[replaceEnd] === "\t" ||
     modifiedSource[replaceEnd] === "\n" || modifiedSource[replaceEnd] === "\r")) {
    replaceEnd++;
  }
  if (replaceEnd < modifiedSource.length && modifiedSource[replaceEnd] === ",") {
    replaceEnd++;
  }

  const replacement = `bodyHtmlFile: "${slug}"`;
  modifiedSource = modifiedSource.substring(0, replaceStart) + replacement + modifiedSource.substring(replaceEnd);
}

console.log(`\n📦 ${filesCreated} files created, ${totalHtmlSize.toLocaleString()} total bytes`);

// Update Article interface
modifiedSource = modifiedSource.replace(
  "bodyHtml?: string;",
  `bodyHtml?: string;
  /** Slug reference for lazy-loaded body HTML */
  bodyHtmlFile?: string;`
);

// Update isPublished
modifiedSource = modifiedSource.replace(
  "return article.bodyHtml !== undefined && article.bodyHtml.length > 0;",
  "return (article.bodyHtml !== undefined && article.bodyHtml.length > 0) || article.bodyHtmlFile !== undefined;"
);

fs.writeFileSync(ARTICLES_TS_PATH, modifiedSource, "utf-8");
console.log(`\n📝 Rewrote articles.ts (${modifiedSource.length.toLocaleString()} bytes, was ${source.length.toLocaleString()} bytes)`);
console.log(`   Reduction: ${((1 - modifiedSource.length / source.length) * 100).toFixed(1)}%`);
console.log("✅ Migration complete!");
