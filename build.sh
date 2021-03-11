version=v1.15.server
docker build -t ndeklein/metabrainnetwork:$version .
docker push ndeklein/metabrainnetwork:$version
