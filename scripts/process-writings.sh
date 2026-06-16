#!/bin/bash
# scripts/process-writings.sh
# Usage: ./scripts/process-writings.sh <slug>

set -e

SLUG=$1
RAW_DIR="public/writings/$SLUG/raw"
DISPLAY_DIR="public/writings/$SLUG"
OCR_TEMP_DIR="/tmp/ocr-processing-$SLUG"

if [ ! -d "$RAW_DIR" ]; then
    echo "Raw directory not found: $RAW_DIR"
    exit 1
fi

echo "Pipeline started for $SLUG..."

# Placeholder for Task 2 & 3 logic
echo "Pipeline complete for $SLUG."
