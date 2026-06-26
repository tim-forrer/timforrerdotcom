---
name: ocr-writings
description: Transcribes handwritten pages to markdown using Google Gemma 4 31B via subagents. Use when the user asks to "process writings", "run OCR", transcribe handwriting, or mentions dropping/adding handwritten page images into a writings folder. Also use for the /skill:ocr-writings command.
---

# OCR Writings

Transcribes handwritten PNG pages into a single markdown file. Uses pi subagents running `google/gemma-4-31b-it` (a multimodal model) — one subagent per page, run in parallel — so no external API calls or API keys are needed.

## Requirements

- ImageMagick (`magick`) installed (`brew install imagemagick`)
- `google/gemma-4-31b-it` enabled as a model in pi settings (it reads images via the `read` tool)

## Inputs

A slug identifying the writing, e.g. `learning-to-write`. The pipeline expects:

- Raw handwritten pages: `public/writings/<slug>/raw/*.png` (numbered, e.g. `Page_1.png`, `Page_2.png` — order is preserved alphabetically)
- OCR prompt template: `ocr-prompt.md` in this skill directory

## Workflow

Follow these steps. Confirm the slug with the user if not given explicitly.

### 1. Validate inputs

```bash
ls public/writings/<slug>/raw/*.png
```

If the `raw/` directory doesn't exist, ask the user where the images are. Stop if no images are found.

### 2. Create display images

Resize each raw PNG to 1024px wide into `public/writings/<slug>/`. These are the images shown on the website **and** used for OCR (no separate OCR-size copy needed — subagents receive the image as an attachment).

```bash
mkdir -p public/writings/<slug>
for file in public/writings/<slug>/raw/*.png; do
    magick "$file" -resize 1024x "public/writings/<slug>/$(basename "$file")"
done
```

### 3. Read the OCR prompt

Read `ocr-prompt.md` from this skill directory (resolve the path relative to this `SKILL.md` file). You will pass its contents to each OCR subagent.

### 4. Run OCR via parallel subagents

This is the core step. Spawn **one subagent per page**, all in a **single message** with `run_in_background: true` so they run concurrently. For each subagent use the `Agent` tool with:

- `subagent_type`: `general-purpose` (has the `read` tool, which sends images as attachments)
- `model`: `google/gemma-4-31b-it`
- `thinking`: `off`
- `run_in_background`: `true`

Each subagent's prompt should be:

```
You are an OCR transcription agent. Read the image at <absolute path to the display PNG> using the read tool, then transcribe the handwriting following these rules:

<paste the full contents of ocr-prompt.md here>

Output ONLY the transcribed text — nothing else.
```

Pass the **absolute path** to each display image (e.g. `/Users/.../public/writings/<slug>/Page_1.png`). Issue all subagent calls in one message so they run in parallel.

### 5. Collect results in page order

Wait for all background subagents to complete. Collect each result, keeping track of which page it was (the order you spawned them). **Assemble the final markdown in filename order** (Page_1, Page_2, ...) — not completion order — so the text reads correctly.

Note: a sentence may continue across a page break (e.g. page 2 ends mid-sentence and page 3 finishes it). Do not insert an extra paragraph break in that case — let the text flow. Use judgment based on the content.

### 6. Ask the user for frontmatter field values

The writings collection (`src/content.config.ts`) requires a YAML frontmatter block at the top of the markdown file. **Do not guess or invent values** — ask the user for each field and wait for their reply before writing the file. Present the fields as a clear list:

- **`title`** (string, required) — the title of the writing.
- **`date`** (date, required) — the date, as `YYYY-MM-DD`.
- **`tags`** (array of strings, required, defaults to `[]`) — e.g. `[handwriting, reflections]`.
- **`description`** (string, optional) — a one-line summary, or omit.
- **`handwriting`** (array of strings, optional) — derived automatically from the display images (see step 7); confirm with the user but do not ask them to type it out.

Once the user has answered, proceed to step 7.

### 7. Write the file with frontmatter

Build the frontmatter block from the user's answers. Construct the `handwriting` list from the display images in `public/writings/<slug>/` in filename order, using web paths of the form `/writings/<slug>/<filename>`.

Write the assembled frontmatter followed by the transcribed text to `src/content/writings/<slug>.md`. The frontmatter must be fenced with `---` delimiters. Example shape:

```markdown
---
title: "Learning to Write"
date: 2026-06-25
tags: [learning, casual]
description: "Trying to write better."
handwriting:
  - "/writings/learning-to-write/Essays_Page_1.png"
  - "/writings/learning-to-write/Essays_Page_2.png"
  - "/writings/learning-to-write/Essays_Page_3.png"
  - "/writings/learning-to-write/Essays_Page_4.png"
---

<transcribed text here, pages separated by a blank line>
```

If the writing has no handwriting images (text-only), omit `handwriting`.

**Do not include a leading heading** in the markdown body. If the handwriting begins with a title (e.g. `# Learning to Write`), omit it from the transcribed output — the title is already rendered from the frontmatter `title` field, so a heading in the body would duplicate it. Begin the body with the first paragraph of prose.

### 8. Clean up

On full success, remove the raw directory:

```bash
rm -rf public/writings/<slug>/raw
```

If any page failed, keep the raw files and report which pages need retrying.

## Output

- `src/content/writings/<slug>.md` — the full transcription
- `public/writings/<slug>/*.png` — display images (1024px wide)

Report a brief summary to the user: number of pages processed, the output path, and any failures.
