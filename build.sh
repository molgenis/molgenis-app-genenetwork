version=v1.13.test
docker build --no-cache -t ndeklein/metabrainnetwork:$version .
docker push ndeklein/metabrainnetwork:$version
