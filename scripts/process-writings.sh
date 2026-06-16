#!/bin/bash
# scripts/process-writings.sh
# Usage: ./scripts/process-writings.sh <slug>

set -e

SLUG=$1

if [ -z "$SLUG" ]; then
    echo "Usage: $0 <slug>"
    exit 1
fi

RAW_DIR="public/writings/$SLUG/raw"
DISPLAY_DIR="public/writings/$SLUG"
OCR_TEMP_DIR="/tmp/ocr-processing-$SLUG"

if [ ! -d "$RAW_DIR" ]; then
    echo "Raw directory not found: $RAW_DIR"
    exit 1
fi

echo "Pipeline started for $SLUG..."

mkdir -p "$DISPLAY_DIR"

echo "Processing display images..."
for file in "$RAW_DIR"/*.png; do
    filename=$(basename "$file")
    magick "$file" -rotate -90 -resize 1024x "$DISPLAY_DIR/$filename"
done

# Placeholder for Task 3 OCR logic
echo "Pipeline complete for $SLUG."
