#!/bin/bash

set -exo pipefail

pnpm exec esbuild src/index.ts \
    --bundle \
    --keep-names \
    --format=cjs \
    --platform=node \
    --target=node16 \
    --outfile=dist/server.js
