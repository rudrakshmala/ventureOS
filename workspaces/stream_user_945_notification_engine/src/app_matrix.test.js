**Testing Framework:** We will use Jest as our testing framework.

**Testing Files:**

*   **`email-alert-dispatcher.test.js`**: Contains tests for the email alert dispatcher.
*   **`users.model.test.js`**: Contains tests for the Users model.
*   **`alerts.model.test.js`**: Contains tests for the Alerts model.
*   **`trigger-events.model.test.js`**: Contains tests for the TriggerEvents model.
*   **`email-templates.model.test.js`**: Contains tests for the EmailTemplates model.
*   **`email-histories.model.test.js`**: Contains tests for the EmailHistories model.
*   **`send-email.test.js`**: Contains tests for the sendEmail function.

**`email-alert-dispatcher.test.js`**
```javascript
const app = require('./email-alert-dispatcher');
const request = require('supertest');

describe('email-alert-dispatcher', () => {
  describe('Users model', () => {
    it('creates a new user', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          username: 'test',
          email: 'test@example.com',
        });
      expect(res.body.success).toBe(true);
    });

    it('gets a user by username and email', async () => {
      const res = await request(app)
        .get('/users')
        .query({
          username: 'test',
          email: 'test@example.com',
        });
      expect(res.body).toEqual({ username: 'test', email: 'test@example.com' });
    });
  });

  describe('Alerts model', () => {
    it('creates a new alert', async () => {
      const res = await request(app)
        .post('/alerts')
        .send({
          name: 'Test Alert',
          description: 'Test alert description',
        });
      expect(res.body.success).toBe(true);
    });

    it('gets an alert by name', async () => {
      const res = await request(app)
        .get('/alerts')
        .query({
          name: 'Test Alert',
        });
      expect(res.body).toEqual({
        name: 'Test Alert',
        description: 'Test alert description',
      });
    });
  });

  describe('TriggerEvents model', () => {
    it('creates a new trigger event', async () => {
      const res = await request(app)
        .post('/trigger-events')
        .send({
          alertId: 1,
          trigger: 'Test trigger',
          action: 'Test action',
        });
      expect(res.body.success).toBe(true);
    });

    it('gets a trigger event by alertId', async () => {
      const res = await request(app)
        .get('/trigger-events')
        .query({
          alertId: 1,
        });
      expect(res.body).toEqual({
        alertId: 1,
        trigger: 'Test trigger',
        action: 'Test action',
      });
    });
  });

  describe('EmailTemplates model', () => {
    it('creates a new email template', async () => {
      const res = await request(app)
        .post('/email-templates')
        .send({
          alertId: 1,
          subject: 'Test email subject',
          body: 'Test email body',
        });
      expect(res.body.success).toBe(true);
    });

    it('gets an email template by alertId', async () => {
      const res = await request(app)
        .get('/email-templates')
        .query({
          alertId: 1,
        });
      expect(res.body).toEqual({
        alertId: 1,
        subject: 'Test email subject',
        body: 'Test email body',
      });
    });
  });

  describe('EmailHistories model', () => {
    it('creates a new email history', async () => {
      const res = await request(app)
        .post('/email-histories')
        .send({
          eventId: 1,
          to: 'test@example.com',
          subject: 'Test email subject',
          body: 'Test email body',
        });
      expect(res.body.success).toBe(true);
    });

    it('gets an email history by eventId', async () => {
      const res = await request(app)
        .get('/email-histories')
        .query({
          eventId: 1,
        });
      expect(res.body).toEqual({
        eventId: 1,
        to: 'test@example.com',
        subject: 'Test email subject',
        body: 'Test email body',
      });
    });
  });

  describe('sendEmail function', () => {
    it('sends an email', async () => {
      const res = await request(app)
        .post('/send-email')
        .send({
          to: 'test@example.com',
          subject: 'Test email subject',
          body: 'Test email body',
        });
      expect(res.body.success).toBe(true);
    });
  });
});
```

**`users.model.test.js`**
```javascript
const database = require('./database');
const Users = require('./users');

describe('Users model', () => {
  beforeAll(async () => {
    await database.connect();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  it('creates a new user', async () => {
    const user = await Users.create({
      username: 'test',
      email: 'test@example.com',
    });
    expect(user.username).toBe('test');
    expect(user.email).toBe('test@example.com');
  });

  it('gets a user by username and email', async () => {
    const user = await Users.get('test', 'test@example.com');
    expect(user.username).toBe('test');
    expect(user.email).toBe('test@example.com');
  });
});
```

**`alerts.model.test.js`**
```javascript
const database = require('./database');
const Alerts = require('./alerts');

describe('Alerts model', () => {
  beforeAll(async () => {
    await database.connect();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  it('creates a new alert', async () => {
    const alert = await Alerts.create({
      name: 'Test Alert',
      description: 'Test alert description',
    });
    expect(alert.name).toBe('Test Alert');
    expect(alert.description).toBe('Test alert description');
  });

  it('gets an alert by name', async () => {
    const alert = await Alerts.get('Test Alert');
    expect(alert.name).toBe('Test Alert');
    expect(alert.description).toBe('Test alert description');
  });
});
```

**`trigger-events.model.test.js`**
```javascript
const database = require('./database');
const TriggerEvents = require('./trigger-events');

describe('TriggerEvents model', () => {
  beforeAll(async () => {
    await database.connect();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  it('creates a new trigger event', async () => {
    const triggerEvent = await TriggerEvents.create({
      alertId: 1,
      trigger: 'Test trigger',
      action: 'Test action',
    });
    expect(triggerEvent.alertId).toBe(1);
    expect(triggerEvent.trigger).toBe('Test trigger');
    expect(triggerEvent.action).toBe('Test action');
  });

  it('gets a trigger event by alertId', async () => {
    const triggerEvent = await TriggerEvents.get(1);
    expect(triggerEvent.alertId).toBe(1);
    expect(triggerEvent.trigger).toBe('Test trigger');
    expect(triggerEvent.action).toBe('Test action');
  });
});
```

**`email-templates.model.test.js`**
```javascript
const database = require('./database');
const EmailTemplates = require('./email-templates');

describe('EmailTemplates model', () => {
  beforeAll(async () => {
    await database.connect();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  it('creates a new email template', async () => {
    const emailTemplate = await EmailTemplates.create({
      alertId: 1,
      subject: 'Test email subject',
      body: 'Test email body',
    });
    expect(emailTemplate.alertId).toBe(1);
    expect(emailTemplate.subject).toBe('Test email subject');
    expect(emailTemplate.body).toBe('Test email body');
  });

  it('gets an email template by alertId', async () => {
    const emailTemplate = await EmailTemplates.get(1);
    expect(emailTemplate.alertId).toBe(1);
    expect(emailTemplate.subject).toBe('Test email subject');
    expect(emailTemplate.body).toBe('Test email body');
  });
});
```

**`email-histories.model.test.js`**
```javascript
const database = require('./database');
const EmailHistories = require('./email-histories');

describe('EmailHistories model', () => {
  beforeAll(async () => {
    await database.connect();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  it('creates a new email history', async () => {
    const emailHistory = await EmailHistories.create({
      eventId: 1,
      to: 'test@example.com',
      subject: 'Test email subject',
      body: 'Test email body',
    });
    expect(emailHistory.eventId).toBe(1);
    expect(emailHistory.to).toBe('test@example.com');
    expect(emailHistory.subject).toBe('Test email subject');
    expect(emailHistory.body).toBe('Test email body');
  });

  it('gets an email history by eventId', async () => {
    const emailHistory = await EmailHistories.get(1);
    expect(emailHistory.eventId).toBe(1);
    expect(emailHistory.to).toBe('test@example.com');
    expect(emailHistory.subject).