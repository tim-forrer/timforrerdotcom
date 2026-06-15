# Handwritten Writings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace typed blog-style writings with handwritten PNGs from a Supernote, with a client-side toggle to switch between handwriting (paginated) and text views. Tags preserved for filtering.

**Architecture:** Content collection schema gains an optional `handwriting` array of PNG paths. The individual writing page renders two views (Original + Text) toggled client-side with no reload. Handwriting view paginates through PNGs; text view renders Markdown body. Listing page uses `handwriting[0]` as thumbnail.

**Tech Stack:** Astro 6.4, TypeScript, Zod (content collections), inline vanilla JS (no framework for interactivity)

---

### Task 1: Create content collection schema with handwriting field

**Files:**
- Create: `src/content/config.ts`
- Verify: `src/content/writings/sample-writing.md`

- [ ] **Step 1: Create content config**

```ts
import { defineCollection, z } from 'astro:content';

const writings = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    hero: z.string().optional(),
    description: z.string().optional(),
    handwriting: z.array(z.string()).optional(),
  }),
});

export const collections = { writings };
```

- [ ] **Step 2: Update sample writing frontmatter to use handwriting field**

Replace `src/content/writings/sample-writing.md` with:

```md
---
title: "Building with Astro in 2026"
date: 2026-06-10
tags: [astro, webdev]
handwriting:
  - "/writings/sample-writing/p1.png"
  - "/writings/sample-writing/p2.png"
description: "Getting started with the best static site generator."
---

## Getting Started

Astro is a fantastic framework for content-driven websites. Here's why I chose it for my personal site.

### Zero JS by Default

Pages ship as static HTML with zero JavaScript. Only add interactivity where you need it.

### Content Collections

Type-safe Markdown with Zod validation — frontmatter errors are caught at build time, not runtime.
```

- [ ] **Step 3: Create placeholder handwritten images**

```bash
mkdir -p public/writings/sample-writing
```

Create `public/writings/sample-writing/p1.png` as a 600×800 transparent PNG with placeholder text (use the existing temp-img.jpg or a simple generated SVG placeholder).

- [ ] **Step 4: Build-verify**

```bash
npm run build
```

Expected: build succeeds, no schema validation errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/config.ts src/content/writings/sample-writing.md public/writings/
git commit -m "feat: add handwriting field to writings collection"
```

---

### Task 2: Create ViewToggle component

**Files:**
- Create: `src/components/ViewToggle.astro`

- [ ] **Step 1: Create component**

```astro
---
export interface Props {
  currentView: 'original' | 'text';
}

const { currentView } = Astro.props;
---

<div class="view-toggle" data-component="view-toggle">
  <button class="toggle-btn" data-view="original" aria-pressed={currentView === 'original'}>
    Original
  </button>
  <button class="toggle-btn" data-view="text" aria-pressed={currentView === 'text'}>
    Text
  </button>
</div>

<script>
  const root = document.querySelector('[data-component="view-toggle"]');
  if (root) {
    const btns = root.querySelectorAll('[data-view]');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        btns.forEach((b) => {
          b.classList.toggle('active', b.dataset.view === view);
          b.setAttribute('aria-pressed', String(b.dataset.view === view));
        });
        root.dispatchEvent(new CustomEvent('view-toggle', { detail: { view } }));
      });
    });
  }
</script>

<style>
  .view-toggle {
    display: flex;
    gap: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    align-self: flex-start;
  }

  .toggle-btn {
    padding: 6px 18px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    font-size: inherit;
  }

  .toggle-btn + .toggle-btn {
    border-left: 1px solid var(--border);
  }

  .toggle-btn.active,
  .toggle-btn[aria-pressed="true"] {
    background: var(--accent);
    color: #fff;
  }

  .toggle-btn:hover:not(.active):not([aria-pressed="true"]) {
    background: #f0eee8;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ViewToggle.astro
git commit -m "feat: add ViewToggle component for switching handwriting/text views"
```

---

### Task 3: Create HWPagination component

**Files:**
- Create: `src/components/HWPagination.astro`

- [ ] **Step 1: Create component**

```astro
---
export interface Props {
  current: number;
  total: number;
}

const { current, total } = Astro.props;
---

<nav class="hw-pagination" data-component="hw-pagination" aria-label="Handwriting page navigation">
  <button class="page-btn" data-action="prev" disabled={current <= 1}>
    ← Prev
  </button>
  <span class="page-count">{current} / {total}</span>
  <button class="page-btn" data-action="next" disabled={current >= total}>
    Next →
  </button>
</nav>

<script>
  const root = document.querySelector('[data-component="hw-pagination"]');
  if (root) {
    const prev = root.querySelector('[data-action="prev"]');
    const next = root.querySelector('[data-action="next"]');
    const count = root.querySelector('.page-count');

    const update = (newPage: number) => {
      root.dispatchEvent(new CustomEvent('page-change', { detail: { page: newPage } }));
    };

    (prev as HTMLButtonElement)?.addEventListener('click', () => {
      const current = parseInt(count?.textContent?.split('/')[0]?.trim() ?? '1', 10);
      if (current > 1) update(current - 1);
    });

    (next as HTMLButtonElement)?.addEventListener('click', () => {
      const parts = count?.textContent?.split('/') ?? ['1', '1'];
      const current = parseInt(parts[0]?.trim() ?? '1', 10);
      const total = parseInt(parts[1]?.trim() ?? '1', 10);
      if (current < total) update(current + 1);
    });
  }
</script>

<style>
  .hw-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 16px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    color: var(--text-muted);
  }

  .page-btn {
    padding: 6px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    color: var(--text-secondary);
    transition: all 0.15s;
  }

  .page-btn:hover:not(:disabled) {
    background: #f5f4f0;
  }

  .page-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/HWPagination.astro
git commit -m "feat: add HWPagination component for prev/next page navigation"
```

---

### Task 4: Update WritingCard to use handwriting thumbnail

**Files:**
- Modify: `src/components/WritingCard.astro`

- [ ] **Step 1: Update component**

Change the image source to use `handwriting[0]` when available, with `hero` as fallback:

```astro
---
import type { CollectionEntry } from 'astro:content';

export interface Props {
  post: CollectionEntry<'writings'>;
}

const { post } = Astro.props;
const readingTime = Math.max(1, Math.ceil((post.body?.length ?? 0) / 1000));
const thumbSrc = post.data.handwriting?.[0] ?? post.data.hero ?? null;
const hasThumb = !!thumbSrc;
---

<article class="card">
  <a href={`/writings/${post.id}`}>
    <div class="thumb">
      {hasThumb && <img src={thumbSrc} alt="" />}
    </div>
    <h2 class="title">{post.data.title}</h2>
    <p class="meta">{readingTime} min read</p>
  </a>
</article>

<style>
  .card {
    break-inside: avoid;
    margin-bottom: 16px;
  }

  .card a {
    display: block;
  }

  .thumb {
    width: 100%;
    aspect-ratio: 1;
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: #e0e0e0;
    margin-bottom: 6px;
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .title {
    font-size: 22px;
    font-weight: 600;
    color: var(--text-title);
    line-height: 1.3;
    margin-bottom: 1px;
  }

  .meta {
    font-size: 16px;
    color: var(--text-muted);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/WritingCard.astro
git commit -m "feat: update WritingCard to use handwriting[0] as thumbnail"
```

---

### Task 5: Update individual writing page with toggle and pagination

**Files:**
- Modify: `src/pages/writings/[...slug].astro`

- [ ] **Step 1: Rewrite the page**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ViewToggle from '../../components/ViewToggle.astro';
import HWPagination from '../../components/HWPagination.astro';
import { getCollection, render } from 'astro:content';
import type { GetStaticPaths } from 'astro';

export async function getStaticPaths() {
  const posts = await getCollection('writings');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);

const readingTime = Math.max(1, Math.ceil((post.body?.length ?? 0) / 1000));
const handwritingPages = post.data.handwriting ?? [];
const hasHandwriting = handwritingPages.length > 0;
---

<BaseLayout title={post.data.title}>
  <article class="writing">
    <!-- Accessibility notice for handwriting pages -->
    {hasHandwriting && (
      <p class="sr-notice">
        This page has handwritten content. Switch to Text view for a readable version.
      </p>
    )}

    <header class="header">
      <h1 class="title">{post.data.title}</h1>
      <div class="meta">
        <time datetime={post.data.date.toISOString()}>
          {post.data.date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </time>
        {!hasHandwriting && (
          <>
            <span class="sep">·</span>
            <span>{readingTime} min read</span>
          </>
        )}
      </div>
      <div class="tags">
        {post.data.tags.map((tag: string) => (
          <span class="tag">{tag}</span>
        ))}
      </div>
    </header>

    {hasHandwriting && (
      <div class="toggle-wrap">
        <ViewToggle currentView="original" />
      </div>
    )}

    <!-- Original (handwriting) view -->
    {hasHandwriting && (
      <div class="view-pane" id="view-original">
        <div class="hw-container" id="hw-container">
          {handwritingPages.map((src, i) => (
            <img
              class="hw-page"
              src={src}
              alt=""
              data-page={i}
              style={{ display: i === 0 ? 'block' : 'none' }}
            />
          ))}
        </div>
        <HWPagination current={1} total={handwritingPages.length} />
      </div>
    )}

    <!-- Text view -->
    <div class="view-pane" id="view-text" style={{ display: hasHandwriting ? 'none' : 'block' }}>
      <div class="text-content">
        <Content />
      </div>
    </div>

  </article>
</BaseLayout>

{hasHandwriting && (
  <script>
    const toggle = document.querySelector('[data-component="view-toggle"]');
    const originalView = document.getElementById('view-original');
    const textView = document.getElementById('view-text');
    const container = document.getElementById('hw-container');

    if (toggle && originalView && textView && container) {
      const pages = container.querySelectorAll('.hw-page');
      const totalPages = pages.length;
      let currentPage = 1;

      function showView(view) {
        if (view === 'original') {
          originalView.style.display = '';
          textView.style.display = 'none';
        } else {
          originalView.style.display = 'none';
          textView.style.display = 'block';
        }
      }

      function showPage(n) {
        currentPage = n;
        pages.forEach((p, i) => {
          p.style.display = i === n - 1 ? 'block' : 'none';
        });
        const pagination = document.querySelector('[data-component="hw-pagination"]');
        if (pagination) {
          const count = pagination.querySelector('.page-count');
          if (count) count.textContent = currentPage + ' / ' + totalPages;
          const prev = pagination.querySelector('[data-action="prev"]');
          const next = pagination.querySelector('[data-action="next"]');
          if (prev) prev.disabled = currentPage <= 1;
          if (next) next.disabled = currentPage >= totalPages;
        }
      }

      toggle.addEventListener('view-toggle', ((e) => {
        showView(e.detail.view);
        if (e.detail.view === 'original') showPage(1);
      }) as EventListener);

      const pagination = document.querySelector('[data-component="hw-pagination"]');
      if (pagination) {
        pagination.addEventListener('page-change', ((e) => {
          showPage(e.detail.page);
        }) as EventListener);
      }
    }
  </script>
)}

<style>
  .writing {
    max-width: 640px;
    margin: 0 auto;
    padding-bottom: 60px;
  }

  .sr-notice {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .header {
    margin-bottom: 16px;
  }

  .title {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-title);
    line-height: 1.3;
    margin-bottom: 8px;
  }

  .meta {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 10px;
    font-family: system-ui, sans-serif;
  }

  .sep {
    margin: 0 6px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag {
    padding: 2px 8px;
    background: #f0f0f0;
    border-radius: 10px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .toggle-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
  }

  .hw-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hw-page {
    max-width: 100%;
    height: auto;
    display: block;
  }

  .view-pane {
    /* toggled via JS display */
  }

  .text-content {
    line-height: 1.8;
    color: var(--text);
  }

  .text-content h2 {
    font-size: 30px;
    margin: 28px 0 12px;
    color: var(--text-title);
  }

  .text-content h3 {
    font-size: 27px;
    margin: 20px 0 8px;
    color: var(--text-title);
  }

  .text-content p {
    margin-bottom: 16px;
  }

  .text-content ul,
  .text-content ol {
    margin: 0 0 16px 24px;
  }

  .text-content li {
    margin-bottom: 4px;
  }

  .text-content code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 14px;
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 3px;
  }

  .text-content pre {
    background: #f5f5f5;
    padding: 16px;
    border-radius: var(--radius-md);
    overflow-x: auto;
    margin-bottom: 16px;
  }

  .text-content pre code {
    background: none;
    padding: 0;
  }

  .text-content blockquote {
    border-left: 3px solid var(--border);
    padding-left: 16px;
    color: var(--text-secondary);
    font-style: italic;
    margin-bottom: 16px;
  }

  .text-content a {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>
```

- [ ] **Step 2: Build-verify**

```bash
npm run build
```

Expected: build succeeds, 8 pages generated (including writings).

- [ ] **Step 3: Commit**

```bash
git add src/pages/writings/[...slug].astro
git commit -m "feat: add toggle + handwriting pagination to individual writing page"
```

---

### Task 6: Update writings listing page for handwriting thumbnails

**Files:**
- Modify: `src/pages/writings/index.astro`

- [ ] **Step 1: Verify the listing page works**

The listing page already uses `WritingCard` which now renders `handwriting[0]` as the thumbnail. No changes needed unless the hero image reference in the latest post section needs updating.

The `latest` post section uses `<WritingCard post={latestPost} />` — the card handles the image source internally. No changes needed.

- [ ] **Step 2: Build-verify**

```bash
npm run build
```

Expected: build succeeds, listing page shows handwriting thumbnails.

---

### Task 7: Final build verification

- [ ] **Step 1: Clean build**

```bash
rm -rf dist && npm run build
```

- [ ] **Step 2: Verify output**

Check that all pages are generated:
```
dist/client/writings/index.html
dist/client/writings/sample-writing/index.html
```

- [ ] **Step 3: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: finalize handwritten writings implementation"
```
