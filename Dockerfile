# author npklein
FROM node:16.13.2

# Set the working directory to /app
WORKDIR /app

RUN apt-get update && apt-get install -y librsvg2-bin


# Copy the current directory contents into the container at /app
COPY package*.json entrypoint.sh ./

# Install any needed packages specified in requirements.txt
RUN npm install
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
