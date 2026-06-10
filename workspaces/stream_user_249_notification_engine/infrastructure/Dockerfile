To create a production-ready Dockerfile for a Node app, we need to follow best practices to ensure the image is optimized for size and performance. Here's a breakdown of the steps involved:

First, we start with an official Node image. We'll use the latest LTS version available. 
Next, we set the working directory to /app and copy the package*.json files to this directory. 
Then, we install the dependencies using npm install. 
After that, we copy the rest of the application code into the container. 
Finally, we expose the port the application will use and define the command to run when the container starts.

Here's a basic outline of what this would look like in a Dockerfile:

The Node app's Dockerfile should start with the FROM instruction, specifying the base image as node:latest or a specific version of Node. 
Then, the WORKDIR instruction sets the working directory in the container to /app.
The COPY instruction is used to copy the package*.json files into the working directory.
The RUN instruction is used to install the dependencies using npm install.
The COPY instruction is used again to copy the rest of the application code into the container.
The EXPOSE instruction exposes the port the application will use.
The CMD instruction defines the command to run when the container starts.

To minimize the image size, it's a good idea to use a multi-stage build, where we build the application in one stage and then copy the resulting files into a smaller runtime stage.

However, a more detailed Dockerfile creation requires knowledge of the app's specific requirements and configuration, so if you provide more details about your Node app, a more tailored Dockerfile can be created.