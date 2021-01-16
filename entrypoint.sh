#!/bin/sh

# author npklein,royoelen

# Stop immediately if any of these scripts fail
set -e

echo "START ENTYPOINT!"
# Run the migration/seed jobs
node data_scripts/createElasticIndex.js
node data_scripts/parseGenesToElastic.js
# add the HPO terms
node data_scripts/parseHpoOboToElastic.js
# add the HPO terms to the elastic search in main view
node data_scripts/parseTermsToElastic.js

# Run the CMD / `docker run ...` command
exec "$@"