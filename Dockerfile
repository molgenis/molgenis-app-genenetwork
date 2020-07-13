# author npklein
FROM node:11.9.0

# Set the working directory to /app
WORKDIR /app

# Set the working directory to /app for downloading librsvg src
WORKDIR /app
# Get tarball and extract
RUN curl -L https://github.com/GNOME/librsvg/archive/2.44.12.tar.gz -o librsvg-2.44.12.tar.gz \  && tar -xvzf librsvg-2.44.12.tar.gz
# Set the working directory to librsvg folder for compiling
WORKDIR /app/librsvg-2.44.12
# Compile rsvg
RUN PATH="$PATH:/usr/lib/x86_64-linux-gnu/gdk-pixbuf-2.0" ./autogen.sh \  && make \  && make install
# Return to main app directory and remove librsvg source
WORKDIR /app
RUN \rm -rf librsvg-2.44.12


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
