As a backend Node.js specialist in the ENG department, I will focus on implementing the proposed enterprise architecture design using Node.js. 

The Node.js implementation will consist of a multi-tiered approach, with separate layers for presentation, application, business logic, data access, and storage.

**Presentation Layer**
In the presentation layer, we will use Express.js as the API Gateway to handle external API interactions. We will also use a Load Balancer to distribute traffic across multiple servers. 

For example, we can use NGINX as the Load Balancer and configure it to distribute traffic across multiple Node.js servers.

**Application Layer**
In the application layer, we will use Node.js servers to host web applications and business logic components. We will also use a Messaging Queue like RabbitMQ or Apache Kafka for asynchronous communication.

For instance, we can use the `amqplib` library to interact with RabbitMQ in our Node.js application.

**Business Logic Layer**
In the business logic layer, we will implement service-oriented architecture (SOA) components using Node.js modules. We will also use a Business Process Management (BPM) system like Camunda to manage workflows.

For example, we can use the `camunda-external-task-client-js` library to interact with Camunda in our Node.js application.

**Data Access Layer**
In the data access layer, we will use a database abstraction layer like Sequelize to interact with various data sources. We will also use a Data Virtualization layer like AWS AppSync to integrate multiple data sources.

For instance, we can use the `sequelize` library to interact with MySQL in our Node.js application.

**Storage Layer**
In the storage layer, we will use relational databases like MySQL for transactional data and NoSQL databases like MongoDB for big data and analytics.

For example, we can use the `mongodb` library to interact with MongoDB in our Node.js application.

**Database Schema**
We will design the database schema using a combination of entity-relationship modeling and object-relational mapping.

For instance, we can define the User entity as follows:
```javascript
const Sequelize = require('sequelize');

const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: Sequelize.STRING,
    unique: true
  },
  password: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  role: {
    type: Sequelize.STRING
  }
});
```
**API Design**
We will design the API using RESTful principles, with endpoints for creating, reading, updating, and deleting resources.

For example, we can define the User API as follows:
```javascript
const express = require('express');
const router = express.Router();

router.post('/users', (req, res) => {
  // Create a new user
  const user = new User(req.body);
  user.save((err) => {
    if (err) {
      res.status(500).send({ message: 'Error creating user' });
    } else {
      res.send({ message: 'User created successfully' });
    }
  });
});

router.get('/users', (req, res) => {
  // Retrieve all users
  User.findAll((err, users) => {
    if (err) {
      res.status(500).send({ message: 'Error retrieving users' });
    } else {
      res.send(users);
    }
  });
});
```
**Security**
We will implement security measures like OAuth 2.0 for API authentication, Role-based access control (RBAC) for authorization, SSL/TLS for encrypting data in transit, and a Network firewall for controlling incoming and outgoing traffic.

For example, we can use the `passport` library to implement OAuth 2.0 in our Node.js application.

**Scalability**
We will design the architecture to scale horizontally, with features like Load Balancing, Caching, and Auto-Scaling.

For instance, we can use a Load Balancer like NGINX to distribute traffic across multiple Node.js servers, and use a Caching mechanism like Redis to reduce database queries.

**Disaster Recovery**
We will implement a disaster recovery plan, with features like Backup and Recovery, Data Replication, and Failover.

For example, we can use a Backup and Recovery tool like MongoDB Atlas to backup our MongoDB database, and use a Data Replication tool like MongoDB Replication to replicate our data across multiple data centers.