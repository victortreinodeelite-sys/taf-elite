#!/bin/bash
set -e
npx @opennextjs/cloudflare build
# Copy all non-assets directories from .open-next to .open-next/assets
for dir in .open-next/*/; do
  dirname=$(basename "$dir")
  if [ "$dirname" != "assets" ]; then
    cp -r "$dir" ".open-next/assets/$dirname"
  fi
done
# Rename worker.js to _worker.js
cp .open-next/worker.js .open-next/assets/_worker.js
echo 'Build complete - worker.js copied as _worker.js to assets/'
