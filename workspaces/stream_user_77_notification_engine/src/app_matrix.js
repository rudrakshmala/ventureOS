```javascript
// models/Users.js
class Users {
  constructor(db) {
    this.db = db;
  }

  async getAllUsers() {
    const result = await this.db.select('*').from('users');
    return result;
  }

  async getUserById(id) {
    const result = await this.db.select('*').from('users').where('id', id);
    return result[0];
  }

  async createUser(name, email, password) {
    const result = await this.db('users').insert({ name, email, password });
    return result;
  }

  async updateUser(id, name, email, password) {
    const result = await this.db('users').where('id', id).update({ name, email, password });
    return result;
  }

  async deleteUser(id) {
    const result = await this.db('users').where('id', id).del();
    return result;
  }
}

// models/Triggers.js
class Triggers {
  constructor(db) {
    this.db = db;
  }

  async getAllTriggers() {
    const result = await this.db.select('*').from('triggers');
    return result;
  }

  async getTriggerById(id) {
    const result = await this.db.select('*').from('triggers').where('id', id);
    return result[0];
  }

  async createTrigger(name, description, condition) {
    const result = await this.db('triggers').insert({ name, description, condition });
    return result;
  }

  async updateTrigger(id, name, description, condition) {
    const result = await this.db('triggers').where('id', id).update({ name, description, condition });
    return result;
  }

  async deleteTrigger(id) {
    const result = await this.db('triggers').where('id', id).del();
    return result;
  }
}

// models/Emails.js
class Emails {
  constructor(db) {
    this.db = db;
  }

  async getAllEmails() {
    const result = await this.db.select('*').from('emails');
    return result;
  }

  async getEmailById(id) {
    const result = await this.db.select('*').from('emails').where('id', id);
    return result[0];
  }

  async dispatchEmail(triggerId, userId, templateId, subject, body) {
    const result = await this.db('emails').insert({ trigger_id: triggerId, user_id: userId, template_id: templateId, subject, body });
    return result;
  }

  async updateEmail(id, triggerId, userId, templateId, subject, body) {
    const result = await this.db('emails').where('id', id).update({ trigger_id: triggerId, user_id: userId, template_id: templateId, subject, body });
    return result;
  }

  async deleteEmail(id) {
    const result = await this.db('emails').where('id', id).del();
    return result;
  }
}

// models/Templates.js
class Templates {
  constructor(db) {
    this.db = db;
  }

  async getAllTemplates() {
    const result = await this.db.select('*').from('templates');
    return result;
  }

  async getTemplateById(id) {
    const result = await this.db.select('*').from('templates').where('id', id);
    return result[0];
  }

  async createTemplate(name, description, subject, body) {
    const result = await this.db('templates').insert({ name, description, subject, body });
    return result;
  }

  async updateTemplate(id, name, description, subject, body) {
    const result = await this.db('templates').where('id', id).update({ name, description, subject, body });
    return result;
  }

  async deleteTemplate(id) {
    const result = await this.db('templates').where('id', id).del();
    return result;
  }
}

// email_alert_dispatcher.js
const express = require('express');
const { createPool } = require('mysql2/p Pool');
const app = express();
const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'email_alert_dispatcher'
});

const users = new Users(pool);
const triggers = new Triggers(pool);
const emails = new Emails(pool);
const templates = new Templates(pool);

app.post('/api/triggers', async (req, res) => {
  try {
    const trigger = await triggers.createTrigger(req.body.name, req.body.description, req.body.condition);
    res.status(201).json(trigger);
  } catch (error) {
    res.status(500).json({ message: 'Error creating trigger' });
  }
});

app.get('/api/triggers', async (req, res) => {
  try {
    const triggers = await triggers.getAllTriggers();
    res.json(triggers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching triggers' });
  }
});

app.get('/api/triggers/:id', async (req, res) => {
  try {
    const trigger = await triggers.getTriggerById(req.params.id);
    res.json(trigger);
  } catch (error) {
    res.status(404).json({ message: 'Trigger not found' });
  }
});

app.put('/api/triggers/:id', async (req, res) => {
  try {
    const trigger = await triggers.updateTrigger(req.params.id, req.body.name, req.body.description, req.body.condition);
    res.json(trigger);
  } catch (error) {
    res.status(404).json({ message: 'Trigger not found' });
  }
});

app.delete('/api/triggers/:id', async (req, res) => {
  try {
    const trigger = await triggers.deleteTrigger(req.params.id);
    res.json(trigger);
  } catch (error) {
    res.status(404).json({ message: 'Trigger not found' });
  }
});

app.post('/api/emails', async (req, res) => {
  try {
    const email = await emails.dispatchEmail(req.body.triggerId, req.body.userId, req.body.templateId, req.body.subject, req.body.body);
    res.json(email);
  } catch (error) {
    res.status(500).json({ message: 'Error dispatching email' });
  }
});

app.get('/api/emails', async (req, res) => {
  try {
    const emails = await emails.getAllEmails();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emails' });
  }
});

app.get('/api/emails/:id', async (req, res) => {
  try {
    const email = await emails.getEmailById(req.params.id);
    res.json(email);
  } catch (error) {
    res.status(404).json({ message: 'Email not found' });
  }
});

app.put('/api/emails/:id', async (req, res) => {
  try {
    const email = await emails.updateEmail(req.params.id, req.body.triggerId, req.body.userId, req.body.templateId, req.body.subject, req.body.body);
    res.json(email);
  } catch (error) {
    res.status(404).json({ message: 'Email not found' });
  }
});

app.delete('/api/emails/:id', async (req, res) => {
  try {
    const email = await emails.deleteEmail(req.params.id);
    res.json(email);
  } catch (error) {
    res.status(404).json({ message: 'Email not found' });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```