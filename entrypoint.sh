#!/bin/sh

# author npklein

# Stop immediately if any of these scripts fail
set -e

echo "Start entrypoint script"
echo "install librsvg2"

echo "Create elastic index"
# Run the migration/seed jobs
node data_scripts/createElasticIndex.js
echo "Done"
echo "Parse genes to elastic"
node data_scripts/parseGenesToElastic.js
echo "Done"
# add the HPO terms
echo "Parse HPO to elastic"
node data_scripts/parseHpoOboToElastic.js
echo "Done"


# Run the CMD / `docker run ...` command
exec "$@"

echo "Finished with entrypoint script"
