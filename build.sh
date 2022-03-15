npm run build
version=v1.16.server
docker build -t ndeklein/metabrainnetwork:$version .
docker push ndeklein/metabrainnetwork:$version
