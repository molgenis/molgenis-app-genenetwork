# author npklein
FROM node:16.13.2

# Set the working directory to /app
WORKDIR /app

# TODO:
# Because there can only be 1 CMD per docker file we need separate Dockerfile for
# each of the servers that gets started. However, they all need to get npm modules
# installed. Should be better way to do this, e.g. https://stackoverflow.com/a/48243640/651779
COPY package*.json ./
RUN npm install
#RUN npm build
RUN npm i natives

# Bundle app source
COPY . .

# Make port 80 available to the world outside this container
EXPOSE 80

# Run app.py when the container launches
CMD [ "node", "PredictionServer.js"]
