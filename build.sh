
version=v1.7.test
docker build -t ndeklein/metabrainnetwork:$version .
docker push ndeklein/metabrainnetwork:$version
