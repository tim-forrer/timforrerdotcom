# Handwriting Automation Design Spec (2026-06-16)

## 1. Overview
Automated pipeline to process handwritten Supernote exports into website-ready display images and searchable markdown content.

## 2. Architecture
- **Pipeline Script**: `scripts/process-writings.sh` (Bash + `jq` + ImageMagick).
- **Workflow**:
    - **Input**: `public/writings/<slug>/raw/` (user-provided).
    - **Prompt**: `scripts/ocr-prompt.md`.
    - **Output**: `public/writings/<slug>/` (display images) and `src/content/writings/<slug>.md` (markdown content).
- **OCR Integration**: Local `curl` request to LMStudio API.

## 3. Processing Logic
- **Tier 1 (Display)**: Iterate `raw/`, `magick` rotate 90° CCW, resize width to 1024px, preserve transparency, save to `public/writings/<slug>/`.
- **Tier 2 (OCR)**: Create `/tmp/ocr-processing-<slug>/`. Process `raw/` images:
    - `magick` flatten to white background.
    - `magick` convert to sRGB (`-type TrueColor -define png:color-type=2`).
    - `magick` resize width to 480px.
    - Save to `/tmp/ocr-processing-<slug>/`.
- **OCR Execution**: Sequential `curl` calls with system prompt + temp image.
- **Output**: Pipe `jq`-parsed JSON transcription directly to `src/content/writings/<slug>.md`.
- **Cleanup**: `rm -rf` raw and temp directories upon success.

## 4. Performance/Memory
Streaming transcription directly to the final markdown file ensures the subagent's context window remains clean and minimal, avoiding loading large API JSON responses into memory.
