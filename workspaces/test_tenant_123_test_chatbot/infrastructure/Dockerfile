To create a production-ready Dockerfile for a Node application, we need to follow best practices for Dockerizing Node.js applications. 

Our Dockerfile will be based on the official Node.js image. We'll set up the working directory, copy the package.json and package-lock.json files to install the dependencies, and then copy the rest of the application code. 

We'll also set the environment to production and expose the port the application will be running on. 

Here's the Dockerfile: 
The Dockerfile will have the following instructions: 
1. Start with the official Node.js image
2. Set up the working directory
3. Copy the package.json and package-lock.json files
4. Install the dependencies
5. Copy the application code
6. Set environment variables
7. Expose the port
8. Run the command to start the application.

The instructions are translated into Dockerfile commands as follows: 
1. FROM node:16
2. WORKDIR /app
3. COPY package*.json ./
4. RUN npm install
5. COPY . .
6. ENV NODE_ENV production
7. EXPOSE 3000
8. CMD [ "node", "server.js" ]