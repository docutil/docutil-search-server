build:
    #!/bin/sh
    test -d node_modules || pnpm i
    pnpm exec esbuild src/index.ts \
        --bundle \
        --keep-names \
        --minify \
        --sourcemap \
        --format=cjs \
        --platform=node \
        --target=node16 \
        --outfile=dist/server.js