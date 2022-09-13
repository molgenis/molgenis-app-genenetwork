# author npklein
FROM node:12.22.12

# Set the working directory to /app
WORKDIR /app

RUN apt-get update && apt-get install -y librsvg2-bin; set -eux; apt-get install -y curl;
RUN apt-get install -y apt-utils
RUN apt-get install -y wait-for-it

# Copy the current directory contents into the container at /app
COPY package*.json entrypoint.sh ./

# fix npm getting stuck on GIT urls
RUN git config --global url."https://".insteadOf git://
# Install any needed packages specified in requirements.txt
RUN npm install --legacy-peer-deps
# --loglevel verbose
# If you are building your code for production
# RUN npm ci --only=production
#

# Bundle app source
COPY . .

RUN npm run build
RUN npm i natives


# Fill elasticsearch with entrypoint.sh script
RUN chmod +x entrypoint.sh  # if not already executable
ENTRYPOINT ["/app/entrypoint.sh"]

# Run app.py when the container launches
CMD ["npm", "run", "start"]
