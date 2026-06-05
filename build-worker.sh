#!/bin/bash
set -e
npx @opennextjs/cloudflare build
PROJECT_DIR=$(pwd)
printf "name=\"taf-elite-bundle\"\ncompatibility_date=\"2024-09-23\"\ncompatibility_flags=[\"nodejs_compat\"]\nmain=\"/.open-next/worker.js\"\n" "$PROJECT_DIR" > /tmp/bundle_wrangler.toml
mkdir -p /tmp/wrangler-output
npx wrangler deploy --dry-run --outdir=/tmp/wrangler-output --config=/tmp/bundle_wrangler.toml
cp /tmp/wrangler-output/worker.js .open-next/_worker.js
echo "Done"
