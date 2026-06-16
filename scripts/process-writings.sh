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
shopt -s nullglob
for file in "$RAW_DIR"/*.png; do
    filename=$(basename "$file")
    if ! magick "$file" -rotate -90 -resize 1024x "$DISPLAY_DIR/$filename"; then
        echo "Warning: Failed to process $filename"
    fi
done
shopt -u nullglob

mkdir -p "$OCR_TEMP_DIR"

echo "Processing OCR images..."
shopt -s nullglob
for file in "$RAW_DIR"/*.png; do
    filename=$(basename "$file")
    if ! magick "$file" -flatten -type TrueColor -define png:color-type=2 -resize 480x "$OCR_TEMP_DIR/$filename"; then
        echo "Warning: Failed to process OCR image $filename"
    fi
done
shopt -u nullglob

echo "Running OCR..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODEL=$(curl -s http://localhost:1234/v1/models | jq -r '.data[0].id')
if [ -z "$MODEL" ] || [ "$MODEL" = "null" ]; then
    echo "Error: Could not retrieve model from LMStudio"
    exit 1
fi
PROMPT=$(cat "$SCRIPT_DIR/ocr-prompt.md")
OUTPUT_FILE="src/content/writings/$SLUG.md"

mkdir -p "$(dirname "$OUTPUT_FILE")"
> "$OUTPUT_FILE"

OCR_SUCCESS=true
shopt -s nullglob
for file in "$OCR_TEMP_DIR"/*.png; do
    filename=$(basename "$file")
    echo "Processing $filename..."
    IMAGE_BASE64=$(base64 -b -i "$file") || { echo "Warning: base64 failed for $filename"; OCR_SUCCESS=false; continue; }
    
    JSON_PAYLOAD=$(jq -n \
        --arg model "$MODEL" \
        --arg prompt "$PROMPT" \
        --arg image "$IMAGE_BASE64" \
        '{model: $model, messages: [{role: "user", content: [{type: "text", text: $prompt}, {type: "image_url", image_url: {url: ("data:image/png;base64," + $image)}}]}]}')
    
    RESPONSE=$(curl -s http://localhost:1234/v1/chat/completions \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD") || { echo "Warning: curl failed for $filename"; OCR_SUCCESS=false; continue; }
    
    if [ -z "$RESPONSE" ] || ! echo "$RESPONSE" | jq -e '.choices[0].message.content' > /dev/null 2>&1; then
        echo "Warning: OCR failed for $filename"
        OCR_SUCCESS=false
        continue
    fi
    
    echo "$RESPONSE" | jq -r '.choices[0].message.content' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done
shopt -u nullglob

if [ ! -s "$OUTPUT_FILE" ]; then
    rm -f "$OUTPUT_FILE"
    echo "Warning: No OCR output generated"
    OCR_SUCCESS=false
fi

echo "Cleanup..."
if [ "$OCR_SUCCESS" = true ]; then
    rm -rf "$RAW_DIR" "$OCR_TEMP_DIR"
else
    echo "Warning: OCR had failures — preserving raw files in $RAW_DIR"
    rm -rf "$OCR_TEMP_DIR"
fi

echo "Pipeline complete for $SLUG."
