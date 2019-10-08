# author npklein
FROM node:11.9.0

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY package*.json entrypoint.sh ./

# Install any needed packages specified in requirements.txt
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

#

RUN npm build
RUN npm i natives

# Bundle app source
COPY . .

# Fill elasticsearch with entrypoint.sh script
RUN chmod +x entrypoint.sh  # if not already executable
ENTRYPOINT ["/app/entrypoint.sh"]

# Run app.py when the container launches
CMD ["npm", "start"]
