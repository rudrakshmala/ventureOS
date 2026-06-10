To create a production-ready Dockerfile for a Node application, it's essential to follow best practices for building efficient and secure Docker images. The Dockerfile should include instructions for setting up the Node environment, installing dependencies, and copying the application code. Here's a step-by-step guide:

First, we start with a base image that includes Node and npm, which are necessary for running Node applications. 

We will use the official Node LTS image to ensure we have the latest long-term support version of Node.js.

Next, we set the working directory in the container to /app, which will hold our application code.

Then, we copy the package*.json files to the working directory to install dependencies. This is done separately from copying the rest of the code to take advantage of Docker's caching mechanism, which can significantly speed up the build process if the dependencies haven't changed.

After installing dependencies using npm install, we copy the rest of the application code into the container.

Finally, we expose the port that our application will listen on and specify the command to run our application when the container starts. 

For example, if our application listens on port 3000 and is started with npm start, the Dockerfile would look like this:

We are using the ENV instruction to set environment variables in the container, and the CMD instruction to set the default command to run when the container starts.

Here is the production-ready Dockerfile:
The Node app Dockerfile creates a Docker image with the Node application and its dependencies, ready to be deployed in a production environment. The image is built using the official Node LTS base image, ensuring the latest long-term support version of Node.js. The Dockerfile instructions are designed to optimize the build process by leveraging Docker's caching mechanism and to ensure the application runs securely and efficiently in production.