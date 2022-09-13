npm run build
version=v1.18.server
docker build -t ndeklein/metabrainnetwork:$version .
docker push ndeklein/metabrainnetwork:$version
