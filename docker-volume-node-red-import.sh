#!/bin/bash

# if the volume file is missing then the script runs docker-compose only
docker volume create node_red_data || true
cat node_red_data_volume.tgz | docker run --rm -i -v node_red_data:/data alpine \
    sh -c 'cd /data && tar -xzf -'
docker-compose -f .devcontainer/docker-compose.yml up -d