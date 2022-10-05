#!/bin/sh

set -exo pipefail

pnpm exec esbuild --bundle --keep-names --format=cjs --platform=node --target=node16 --outfile=dist/server.js src/index.ts