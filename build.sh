docker login
version=v1.11.test
docker build --no-cache -t ndeklein/metabrainnetwork:$version .
docker push ndeklein/metabrainnetwork:$version
