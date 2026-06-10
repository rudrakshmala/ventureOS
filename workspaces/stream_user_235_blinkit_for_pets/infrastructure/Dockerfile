To create a production-ready Dockerfile for a Node app, we need to follow best practices for Dockerizing a Node application. 

The Dockerfile should start by selecting an official Node image, setting up the working directory, copying the package*.json files to install dependencies, installing the dependencies, copying the application code, and finally, exposing the port and running the command to start the Node app.

Here's a basic structure of what the instructions would look like: 
Begin by specifying the base image for the Dockerfile. 
Set the working directory in the container to /app. 
Copy the package*.json files to the working directory. 
Install the dependencies using npm install. 
Copy the application code to the working directory. 
Expose the port the application will run on. 
Set the command to run the application when the container starts.

This process results in a lean and efficient Docker image that can be used in a production environment. It minimizes the image size by separating the installation of dependencies and the copying of the application code into separate layers, allowing for more efficient caching during the Docker build process.