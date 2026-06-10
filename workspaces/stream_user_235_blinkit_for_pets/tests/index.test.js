To write Jest unit tests for the proposed enterprise architecture design, we need to focus on the individual components and layers. Here are some examples of unit tests for each layer:

**Presentation Layer**

We can test the Express.js API Gateway and Load Balancer using Jest's `supertest` library. For example:
```javascript
const request = require('supertest');
const app = require('./app');

describe('GET /users', () => {
  it('should return a list of users', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
```

**Application Layer**

We can test the Node.js servers and Messaging Queue using Jest's `jest-mock` library. For example:
```javascript
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

jest.mock('amqplib');

describe('send message to queue', () => {
  it('should send a message to the queue', async () => {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queueName = 'my-queue';
    const message = 'Hello World';
    await channel.assertQueue(queueName, { durable: true });
    await channel.sendToQueue(queueName, Buffer.from(message));
    expect(channel.sendToQueue).toHaveBeenCalledTimes(1);
  });
});
```

**Business Logic Layer**

We can test the service-oriented architecture (SOA) components using Jest's `jest-mock` library. For example:
```javascript
const camunda = require('camunda-external-task-client-js');

jest.mock('camunda-external-task-client-js');

describe('complete task', () => {
  it('should complete a task', async () => {
    const client = new camunda.ExternalTaskClient({
      baseUrl: 'http://localhost:8080/engine-rest',
    });
    const taskId = 'my-task-id';
    await client.complete(taskId, {
      variables: {
        result: 'success',
      },
    });
    expect(client.complete).toHaveBeenCalledTimes(1);
  });
});
```

**Data Access Layer**

We can test the database abstraction layer using Jest's `jest-mock` library. For example:
```javascript
const sequelize = require('sequelize');
const User = require('./models/User');

jest.mock('sequelize');

describe('create user', () => {
  it('should create a new user', async () => {
    const user = new User({
      username: 'john-doe',
      password: 'password',
      email: 'john.doe@example.com',
      role: 'admin',
    });
    await user.save();
    expect(user.save).toHaveBeenCalledTimes(1);
  });
});
```

**Storage Layer**

We can test the relational databases using Jest's `jest-mock` library. For example:
```javascript
const mongoose = require('mongoose');
const User = require('./models/User');

jest.mock('mongoose');

describe('create user', () => {
  it('should create a new user', async () => {
    const user = new User({
      username: 'john-doe',
      password: 'password',
      email: 'john.doe@example.com',
      role: 'admin',
    });
    await user.save();
    expect(user.save).toHaveBeenCalledTimes(1);
  });
});
```

**API Design**

We can test the API design using Jest's `supertest` library. For example:
```javascript
const request = require('supertest');
const app = require('./app');

describe('POST /users', () => {
  it('should create a new user', async () => {
    const response = await request(app).post('/users').send({
      username: 'john-doe',
      password: 'password',
      email: 'john.doe@example.com',
      role: 'admin',
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

**Security**

We can test the security measures using Jest's `jest-mock` library. For example:
```javascript
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');

jest.mock('passport');
jest.mock('passport-oauth2');

describe('authenticate user', () => {
  it('should authenticate a user', async () => {
    const req = {
      body: {
        username: 'john-doe',
        password: 'password',
      },
    };
    const res = {
      send: jest.fn(),
    };
    await passport.authenticate('oauth2', {
      successRedirect: '/',
      failureRedirect: '/login',
    })(req, res);
    expect(res.send).toHaveBeenCalledTimes(1);
  });
});
```

**Scalability**

We can test the scalability features using Jest's `jest-mock` library. For example:
```javascript
const redis = require('redis');
const client = redis.createClient();

jest.mock('redis');

describe('cache user', () => {
  it('should cache a user', async () => {
    const user = {
      id: 1,
      username: 'john-doe',
    };
    await client.set('user:1', JSON.stringify(user));
    expect(client.set).toHaveBeenCalledTimes(1);
  });
});
```

**Disaster Recovery**

We can test the disaster recovery features using Jest's `jest-mock` library. For example:
```javascript
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

jest.mock('mongodb');

describe('backup database', () => {
  it('should backup the database', async () => {
    const client = new MongoClient('mongodb://localhost:27017');
    const db = client.db();
    await db.collection('users').find().toArray();
    expect(client.db).toHaveBeenCalledTimes(1);
  });
});
```