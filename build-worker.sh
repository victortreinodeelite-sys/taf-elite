#!/bin/bash
set -e

# Run OpenNext build
npx @opennextjs/cloudflare build

# Get absolute project directory
PROJECT_DIR=$(pwd)
echo "Project dir: $PROJECT_DIR"

# Create temp wrangler config with absolute path using echo
echo "name = \"taf-elite-bundle\"" > /tmp/bundle_wrangler.toml
echo "compatibility_date = \"2024-09-23\"" >> /tmp/bundle_wrangler.toml
echo "compatibility_flags = [\"nodejs_compat\"]" >> /tmp/bundle_wrangler.toml
echo "main = \"${PROJECT_DIR}/.open-next/worker.js\"" >> /tmp/bundle_wrangler.toml

echo "Generated wrangler config:"
cat /tmp/bundle_wrangler.toml

# Bundle using wrangler dry-run
mkdir -p /tmp/wrangler-output
npx wrangler deploy --dry-run --outdir=/tmp/wrangler-output --config=/tmp/bundle_wrangler.toml

# Copy bundled result as _worker.js
cp /tmp/wrangler-output/worker.js .open-next/_worker.js
echo "Done: $(wc -c < .open-next/_worker.js) bytes"
