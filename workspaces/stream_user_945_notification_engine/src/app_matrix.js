**email-alert-dispatcher.js**

```javascript
const express = require('express');
const app = express();
const mysql = require('mysql');
const nodemailer = require('nodemailer');

// Configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'email_alert_dispacher',
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Function to connect to DB
async function connectToDB() {
  return await pool.getConnection();
}

// Users model
class Users {
  static async createUser(data) {
    const query = 'INSERT INTO users SET ?';
    return new Promise((resolve, reject) => {
      connectToDB().then((conn) => {
        conn.query(query, data, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
  }

  static async getUser(username, email) {
    const query = 'SELECT * FROM users WHERE username = ? AND email = ?';
    return new Promise((resolve, reject) => {
      connectToDB().then((conn) => {
        conn.query(query, [username, email], (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results[0]);
          }
        });
      });
    });
  }
}

// Alerts model
class Alerts {
  static async createAlert(data) {
    const query = 'INSERT INTO alerts SET ?';
    return new Promise((resolve, reject) => {
      connectToDB().then((conn) => {
        conn.query(query, data, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
  }

  static async getAlert(name) {
    const query = 'SELECT * FROM alerts WHERE name = ?';
    return new Promise((resolve, reject) => {
      connectToDB().then((conn) => {
        conn.query(query, [name], (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results[0]);
          }
        });
      });
    });
  }
}

// Trigger events model
class TriggerEvents {
  static async createEvent(data) {
    const query = 'INSERT INTO triggerEvents SET ?';
    return new Promise((resolve, reject) => {
      connectToDB().then((conn) => {
        conn.query(query, data, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
  }

  static async getEvent(alertId) {
    const query = 'SELECT * FROM triggerEvents WHERE alertId = ?';
    return new Promise((resolve, reject) => {
      connectToDB().then((conn) => {
        conn.query(query, [alertId], (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results[0]);
          }
        });
      });
    });
  }
}

// Email templates model
class EmailTemplates {
  static async createTemplate(data) {
    const query = 'INSERT INTO emailTemplates SET ?';
    return new Promise((resolve, reject) => {
      connectToDB().then((conn) => {
        conn.query(query, data, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
  }

  static async getTemplate(alertId) {
    const query = 'SELECT * FROM emailTemplates WHERE alertId = ?';
    return new Promise((resolve, reject) => {
      connectToDB().then((conn) => {
        conn.query(query, [alertId], (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results[0]);
          }
        });
      });
    });
  }
}

// Email histories model
class EmailHistories {
  static async createEmailHistory(data) {
    const query = 'INSERT INTO emailHistories SET ?';
    return new Promise((resolve, reject) => {
      connectToDB().then((conn) => {
        conn.query(query, data, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
  }

  static async getEmailHistory(eventId) {
    const query = 'SELECT * FROM emailHistories WHERE eventId = ?';
    return new Promise((resolve, reject) => {
      connectToDB().then((conn) => {
        conn.query(query, [eventId], (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results[0]);
          }
        });
      });
    });
  }
}

// NodeMailer setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // or 'STARTTLS'
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password',
  },
});

// Send email
async function sendEmail(data) {
  try {
    const info = await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: data.to,
      subject: data.subject,
      text: data.text,
    });
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ' + error);
  }
}

// API endpoints
app.post('/users', async (req, res) => {
  const data = req.body;
  try {
    await Users.createUser(data);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/users', async (req, res) => {
  const username = req.query.username;
  const email = req.query.email;
  try {
    const user = await Users.getUser(username, email);
    res.json(user);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/alerts', async (req, res) => {
  const data = req.body;
  try {
    await Alerts.createAlert(data);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/alerts', async (req, res) => {
  const name = req.query.name;
  try {
    const alert = await Alerts.getAlert(name);
    res.json(alert);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/trigger-events', async (req, res) => {
  const data = req.body;
  try {
    await TriggerEvents.createEvent(data);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/trigger-events', async (req, res) => {
  const alertId = req.query.alertId;
  try {
    const event = await TriggerEvents.getEvent(alertId);
    res.json(event);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/email-templates', async (req, res) => {
  const data = req.body;
  try {
    await EmailTemplates.createTemplate(data);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/email-templates', async (req, res) => {
  const alertId = req.query.alertId;
  try {
    const template = await EmailTemplates.getTemplate(alertId);
    res.json(template);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/email-histories', async (req, res) => {
  const data = req.body;
  try {
    await EmailHistories.createEmailHistory(data);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/email-histories', async (req, res) => {
  const eventId = req.query.eventId;
  try {
    const history = await EmailHistories.getEmailHistory(eventId);
    res.json(history);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/send-email', async (req, res) => {
  const data = req.body;
  try {
    await sendEmail(data);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

Note: The code above is for demonstration purposes only. Please replace the placeholders with your actual database credentials and email account details.