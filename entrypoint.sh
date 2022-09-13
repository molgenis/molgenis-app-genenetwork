#!/bin/sh

# author npklein

# Stop immediately if any of these scripts fail
set -e

echo "Start entrypoint script"
echo "install librsvg2"

# wait for elasticsearch to become available
wait-for-it elasticsearch:9200

# Run the migration/seed jobs
node data_scripts/createElasticIndex.js
node data_scripts/parseGenesToElastic.js

node data_scripts/parseHpoOboToElastic.js

# Run the CMD / `docker run ...` command
exec "$@"

echo "Finished with entrypoint script"
