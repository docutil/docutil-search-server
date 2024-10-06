#!/bin/sh

test -d node_modules || bun install
bun x esbuild src/index.ts \
    --bundle \
    --keep-names \
    --minify \
    --sourcemap \
    --format=esm \
    --platform=node \
    --target=node18 \
    --outfile=dist/server.mjs