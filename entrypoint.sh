#!/bin/sh

# Stop immediately if any of these scripts fail
set -e

echo "START ENTYPOINT!"
# Run the migration/seed jobs
node data_scripts/createElasticIndex.js
node data_scripts/parseGenesToElastic.js

# Run the CMD / `docker run ...` command
exec "$@"
