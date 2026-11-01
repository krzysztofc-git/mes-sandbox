#!/bin/bash

rm -rf node-red-uibuilder/*
mkdir node-red-uibuilder

docker run --rm \
    -v node_red_data:/source:ro \
    -v "$(pwd)/node-red-uibuilder":/dest \
    --user 1000:1000 \
    alpine sh -c "cd /source/uibuilder && tar -cf - ." \
    | tar -xpf - -C node-red-uibuilder --owner=1000 --group=1000