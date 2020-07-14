docker login
version=v1.12.test
docker build --no-cache -t ndeklein/metabrainnetwork:$version .
docker push ndeklein/metabrainnetwork:$version
