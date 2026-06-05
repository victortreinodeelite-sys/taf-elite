#!/bin/bash
set -e
npx @opennextjs/cloudflare build
echo "Build complete. Output in .open-next/"
ls -la .open-next/
