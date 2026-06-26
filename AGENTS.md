<!-- tools -->
OCR of handwritten writings is handled by the `ocr-writings` skill (`.pi/skills/ocr-writings/`), which transcribes pages to markdown using `google/gemma-4-31b-it` subagents in parallel. No API key needed — pi manages credentials. Requires ImageMagick (`brew install imagemagick`). Invoke by asking the agent to process a writings slug, or `/skill:ocr-writings <slug>`.
<!-- tools -->
