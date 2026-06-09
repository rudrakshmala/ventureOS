Here's a thorough implementation of automated testing blocks for the provided code. This implementation uses Jest as the testing framework and utilizes the Supertest library for testing the Express.js application.

Firstly, let's setup Jest and Supertest.

```bash
npm install --save-dev jest supertest
```

Next, let's configure Jest in `package.json`.

```json
"scripts": {
  "test": "jest"
},
"jest": {
  "moduleNameMapper": {
    "@/(.*)": "<rootDir>/src/$1"
  },
  "setupFiles": [
    "<rootDir>/config/jest.setup.js"
  ],
  "testEnvironment": "node",
  "transform": {
    "node_modules/express": "empty-module",
    "node_modules/mysql2": "empty-module",
    "node_modules/mysql2/poll": "empty-module"
  },
  "testURL": "http://localhost/test"
}
```

Now, let's create a `jest.setup.js` file in the `config` directory.

```javascript
// config/jest.setup.js
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'email_alert_dispatcher',
};

const supertest = require('supertest');
const app = require('@/app.js');
const request = supertest(app);

module.exports = {
  dbConfig,
  request
};
```

Let's create an `app.js` file to separate app configuration from the main application.

```javascript
// src/app.js
const express = require('express');
const { createPool } = require('mysql2/p Pool');
const app = express();
const pool = createPool(dbConfig);

const users = new Users(pool);
const triggers = new Triggers(pool);
const emails = new Emails(pool);
const templates = new Templates(pool);

// ... (rest of the code)

module.exports = app;
```

Here are the automated testing blocks.

```javascript
// tests/users.test.js
const request = require('../config/jest.setup');
const Users = require('@/models/Users');

describe('Users Model', () => {
  beforeAll(async () => {
    await request.dbConfig.query('TRUNCATE TABLE users RESTART IDENTITY');
  });

  afterAll(async () => {
    await request.dbConfig.query('TRUNCATE TABLE users RESTART IDENTITY');
  });

  it('should create a new user', async () => {
    const user = await request.request.post('/api/users').send({ name: 'Test User', email: 'test@example.com', password: 'password' });
    expect(user.status).toBe(201);
  });

  it('should get all users', async () => {
    const user = await request.request.post('/api/users').send({ name: 'Test User', email: 'test@example.com', password: 'password' });
    const users = await request.request.get('/api/users').send();
    expect(users.body).toBeInstanceOf(Array);
  });

  it('should get a user by id', async () => {
    const user = await request.request.post('/api/users').send({ name: 'Test User', email: 'test@example.com', password: 'password' });
    const users = await request.request.get(`/api/users/${user.body.id}`).send();
    expect(users.body).toBeInstanceOf(Object);
  });

  it('should update a user', async () => {
    const user = await request.request.post('/api/users').send({ name: 'Test User', email: 'test@example.com', password: 'password' });
    const updatedUser = await request.request.put(`/api/users/${user.body.id}`).send({ name: 'Updated User', email: 'updated@example.com', password: 'password' });
    expect(updatedUser.status).toBe(200);
  });

  it('should delete a user', async () => {
    const user = await request.request.post('/api/users').send({ name: 'Test User', email: 'test@example.com', password: 'password' });
    const deletedUser = await request.request.delete(`/api/users/${user.body.id}`).send();
    expect(deletedUser.status).toBe(200);
  });
});

```

```javascript
// tests/triggers.test.js
const request = require('../config/jest.setup');
const Triggers = require('@/models/Triggers');

describe('Triggers Model', () => {
  beforeAll(async () => {
    await request.dbConfig.query('TRUNCATE TABLE triggers RESTART IDENTITY');
  });

  afterAll(async () => {
    await request.dbConfig.query('TRUNCATE TABLE triggers RESTART IDENTITY');
  });

  it('should create a new trigger', async () => {
    const trigger = await request.request.post('/api/triggers').send({ name: 'Test Trigger', description: 'This is a test trigger', condition: 'test-condition' });
    expect(trigger.status).toBe(201);
  });

  it('should get all triggers', async () => {
    const trigger = await request.request.post('/api/triggers').send({ name: 'Test Trigger', description: 'This is a test trigger', condition: 'test-condition' });
    const triggers = await request.request.get('/api/triggers').send();
    expect(triggers.body).toBeInstanceOf(Array);
  });

  it('should get a trigger by id', async () => {
    const trigger = await request.request.post('/api/triggers').send({ name: 'Test Trigger', description: 'This is a test trigger', condition: 'test-condition' });
    const triggers = await request.request.get(`/api/triggers/${trigger.body.id}`).send();
    expect(triggers.body).toBeInstanceOf(Object);
  });

  it('should update a trigger', async () => {
    const trigger = await request.request.post('/api/triggers').send({ name: 'Test Trigger', description: 'This is a test trigger', condition: 'test-condition' });
    const updatedTrigger = await request.request.put(`/api/triggers/${trigger.body.id}`).send({ name: 'Updated Trigger', description: 'This is an updated trigger', condition: 'updated-condition' });
    expect(updatedTrigger.status).toBe(200);
  });

  it('should delete a trigger', async () => {
    const trigger = await request.request.post('/api/triggers').send({ name: 'Test Trigger', description: 'This is a test trigger', condition: 'test-condition' });
    const deletedTrigger = await request.request.delete(`/api/triggers/${trigger.body.id}`).send();
    expect(deletedTrigger.status).toBe(200);
  });
});

```

```javascript
// tests/emails.test.js
const request = require('../config/jest.setup');
const Emails = require('@/models/Emails');

describe('Emails Model', () => {
  beforeAll(async () => {
    await request.dbConfig.query('TRUNCATE TABLE emails RESTART IDENTITY');
  });

  afterAll(async () => {
    await request.dbConfig.query('TRUNCATE TABLE emails RESTART IDENTITY');
  });

  it('should dispatch a new email', async () => {
    const email = await request.request.post('/api/emails').send({ triggerId: 1, userId: 1, templateId: 1, subject: 'Test Email', body: 'This is a test email' });
    expect(email.status).toBe(201);
  });

  it('should get all emails', async () => {
    const email = await request.request.post('/api/emails').send({ triggerId: 1, userId: 1, templateId: 1, subject: 'Test Email', body: 'This is a test email' });
    const emails = await request.request.get('/api/emails').send();
    expect(emails.body).toBeInstanceOf(Array);
  });

  it('should get an email by id', async () => {
    const email = await request.request.post('/api/emails').send({ triggerId: 1, userId: 1, templateId: 1, subject: 'Test Email', body: 'This is a test email' });
    const emails = await request.request.get(`/api/emails/${email.body.id}`).send();
    expect(emails.body).toBeInstanceOf(Object);
  });

  it('should update an email', async () => {
    const email = await request.request.post('/api/emails').send({ triggerId: 1, userId: 1, templateId: 1, subject: 'Test Email', body: 'This is a test email' });
    const updatedEmail = await request.request.put(`/api/emails/${email.body.id}`).send({ triggerId: 1, userId: 1, templateId: 1, subject: 'Updated Email', body: 'This is an updated email' });
    expect(updatedEmail.status).toBe(200);
  });

  it('should delete an email', async () => {
    const email = await request.request.post('/api/emails').send({ triggerId: 1, userId: 1, templateId: 1, subject: 'Test Email', body: 'This is a test email' });
    const deletedEmail = await request.request.delete(`/api/emails/${email.body.id}`).send();
    expect(deletedEmail.status).toBe(200);
  });
});

```

```javascript
// tests/templates.test.js
const request = require('../config/jest.setup');
const Templates = require('@/models/Templates');

describe('Templates Model', () => {
  beforeAll(async () => {
    await request.dbConfig.query('TRUNCATE TABLE templates RESTART IDENTITY');
  });

  afterAll(async () => {
    await request.dbConfig.query('TRUNCATE TABLE templates RESTART IDENTITY');
  });

  it('should create a new template', async () => {
    const template = await request.request.post('/api/templates').send({ name