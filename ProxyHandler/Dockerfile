# Use the official Node.js 14 image from DockerHub
FROM node:14

# Create a directory where our app will be placed
RUN mkdir -p /usr/src/app

# Change directory so that our commands run inside this new directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json /usr/src/app/

# Install dependecies
RUN npm install

# Copy the rest of the application code
COPY . /usr/src/app

# Export env variables
ARG CONNECT_OPTION
ENV CONNECT_OPTION=$CONNECT_OPTION

# Expose port for application
EXPOSE 3000

# Serve the app
CMD ["node", "app.js"]
