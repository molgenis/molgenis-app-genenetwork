#!/bin/sh

# author npklein

# Stop immediately if any of these scripts fail
set -e

echo "START ENTYPOINT!"
# Run the migration/seed jobs
node data_scripts/createElasticIndex.js
node data_scripts/parseGenesToElastic.js
# add the HPO terms
node data_scripts/parseHpoOboToElastic.js

# Run the CMD / `docker run ...` command
exec "$@"