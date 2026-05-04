#!/bin/bash

docker run --rm -v node_red_data:/data alpine sh -c "cd /data && tar -czf - ." > node_red_data_volume.tgz