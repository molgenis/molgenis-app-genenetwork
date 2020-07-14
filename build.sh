docker login
version=v1.9.server
docker build --no-cache -t ndeklein/metabrainnetwork:$version .
docker push ndeklein/metabrainnetwork:$version
