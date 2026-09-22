#!/usr/bin/env bash
#
# Prepare handwriting pages for a writing.
#
# Resizes raw page scans to 1024px-wide display images named p1.png, p2.png, ...
# in public/writings/<slug>/, then folds the source scans away.

set -euo pipefail

usage() {
  cat <<'EOF'
Prepare handwriting pages for a writing.

Resizes raw page scans to 1024px-wide display images named p1.png, p2.png, ...
in public/writings/<slug>/, then removes the source scans.

Usage:
  prepare-images.sh <slug> [--keep]

Sources, in order of preference:
  1. public/writings/<slug>/raw/*.png
  2. any *.png directly in public/writings/<slug>/ that is not already p<N>.png

Pages are ordered by the number in the filename (Page_2 before Page_10) and
mapped onto p1..pN in that order, so a re-export with different filenames still
lands in the right slots. Stale p<N>.png beyond the new page count are removed.
.DS_Store is cleaned up. Document paths in the writing's frontmatter do not change.

Options:
  --keep   leave the source scans in place instead of deleting them.
EOF
}

SLUG="${1:-}"
KEEP=false
case "${2:-}" in
  --keep) KEEP=true ;;
  "") ;;
  *) echo "error: unknown option '${2}'" >&2; usage >&2; exit 2 ;;
esac

if [ -z "$SLUG" ] || [ "$SLUG" = "-h" ] || [ "$SLUG" = "--help" ]; then
  usage
  exit 0
fi

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
DEST="$ROOT/public/writings/$SLUG"

if [ ! -d "$DEST" ]; then
  echo "error: no such directory: $DEST" >&2
  exit 1
fi

# tidy macOS cruft so it can't be mistaken for a page scan
find "$DEST" -name '.DS_Store' -delete 2>/dev/null || true

sources=()
if [ -d "$DEST/raw" ]; then
  for f in "$DEST"/raw/*.png; do [ -e "$f" ] && sources+=("$f"); done
fi

if [ "${#sources[@]}" -eq 0 ]; then
  for f in "$DEST"/*.png; do
    [ -e "$f" ] || continue
    case "$(basename "$f")" in
      p[0-9]*.png) ;;                 # already a prepared display image
      *) sources+=("$f") ;;
    esac
  done
fi

if [ "${#sources[@]}" -eq 0 ]; then
  echo "nothing to do: no source scans found in $DEST" >&2
  echo "drop the pages in $DEST/raw/ or directly in $DEST/" >&2
  exit 1
fi

# natural sort, so Page_2 sorts before Page_10
ordered=()
while IFS= read -r line; do ordered+=("$line"); done \
  < <(printf '%s\n' "${sources[@]}" | sort -V)

echo "Preparing ${#ordered[@]} page(s) for '$SLUG':"
n=0
for src in "${ordered[@]}"; do
  n=$((n + 1))
  out="$DEST/p$n.png"
  magick "$src" -resize 1024x "$out"
  printf '  %-28s -> p%d.png  %s\n' \
    "$(basename "$src")" "$n" "$(magick identify -format '%wx%h' "$out")"
done

# verify every expected output before destroying anything
for i in $(seq 1 "$n"); do
  out="$DEST/p$i.png"
  if [ ! -s "$out" ]; then
    echo "error: expected output missing or empty: $out" >&2
    echo "source scans left in place; nothing was deleted" >&2
    exit 1
  fi
done

# drop leftovers from a previous export that had more pages
for old in "$DEST"/p[0-9]*.png; do
  [ -e "$old" ] || continue
  idx="$(basename "$old" .png)"
  idx="${idx#p}"
  if [ "$idx" -gt "$n" ] 2>/dev/null; then
    rm -f "$old"
    echo "  removed stale p$idx.png (new export has $n page(s))"
  fi
done

if [ "$KEEP" = true ]; then
  echo "Kept source scans (--keep)."
else
  for src in "${ordered[@]}"; do rm -f "$src"; done
  if [ -d "$DEST/raw" ]; then
    rmdir "$DEST/raw" 2>/dev/null || true
  fi
  echo "Removed source scans."
fi

echo "Done. Display images:"
ls -1 "$DEST"/p*.png
