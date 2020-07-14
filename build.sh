version=v1.14.test
docker build -t ndeklein/metabrainnetwork:$version .
docker push ndeklein/metabrainnetwork:$version
