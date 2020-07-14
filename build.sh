docker login
version=v1.10.server
docker build --no-cache -t ndeklein/metabrainnetwork:$version .
docker push ndeklein/metabrainnetwork:$version
