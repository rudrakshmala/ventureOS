To create a production-ready Dockerfile for a Node application, we need to follow best practices for building and running the application in a container. Here's a step-by-step breakdown of the Dockerfile instructions:

1. **Choose a base image**: We'll use the official Node.js image as our base. This provides us with the Node.js runtime environment and packages.

2. **Set working directory**: Set the working directory to /app to keep our application code organized.

3. **Copy package*.json files**: Copy the package.json and package-lock.json files into the working directory. This allows us to install dependencies before copying the rest of the application code.

4. **Install dependencies**: Run npm install to install the dependencies specified in package.json.

5. **Copy application code**: Copy the rest of the application code into the working directory.

6. **Expose port**: Expose the port that the application will use to listen for incoming requests.

7. **Set environment variables**: Set the NODE_ENV environment variable to production to enable production mode.

8. **Define the command to run the application**: Specify the command to run the application when the container starts.

Here are the Dockerfile instructions: 
The Dockerfile will start with the FROM instruction, followed by the base image. 
The RUN instruction will be used to install dependencies and set environment variables. 
The COPY instruction will be used to copy the application code and package*.json files into the working directory. 
The EXPOSE instruction will be used to expose the port. 
The CMD instruction will be used to define the command to run the application.

For this specific use case, I will assume that the application listens on port 3000, and the application code is in the current directory. The Dockerfile instructions are: 
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
ENV NODE_ENV production
CMD [ "node", "server.js" ]