#!/bin/bash

rm -rf node-red-library/*

docker run --rm \
    -v node_red_data:/source:ro \
    -v "$(pwd)/node-red-library":/dest \
    --user 1000:1000 \
    alpine sh -c "cd /source/lib && tar -cf - ." \
    | tar -xpf - -C node-red-library --owner=1000 --group=1000