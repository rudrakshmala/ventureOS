```javascript
const express = require('express');
const app = express();
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const emailConfig = require('./email-config.json');

// Database connection settings
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'email_alert_dispatcher'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('error connecting:', err);
    return;
  }
  console.log('connected as id ' + db.threadId);
});

// Create transporter for node-mailer
const transporter = nodemailer.createTransport({
  host: emailConfig.transporter.host,
  port: emailConfig.transporter.port,
  secure: emailConfig.transporter.secure,
  auth: {
    user: emailConfig.transporter.auth.user,
    pass: emailConfig.transporter.auth.pass
  }
});

// API endpoint to create a new trigger
app.post('/triggers', (req, res) => {
  const query = `INSERT INTO Triggers (type, description) VALUES (?, ?)`;
  db.query(query, [req.body.type, req.body.description], (err, results) => {
    if (err) {
      console.error('error:', err);
      res.status(500).send({ message: 'Error creating trigger' });
    } else {
      res.send({ message: 'Trigger created successfully', triggerId: results.insertId });
    }
  });
});

// API endpoint to retrieve a list of all triggers
app.get('/triggers', (req, res) => {
  const query = `SELECT * FROM Triggers`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('error:', err);
      res.status(500).send({ message: 'Error retrieving triggers' });
    } else {
      res.send(results);
    }
  });
});

// API endpoint to create a new email template
app.post('/email-templates', (req, res) => {
  const query = `INSERT INTO Email_Templates (subject, body, trigger_id) VALUES (?, ?, ?)`;
  db.query(query, [req.body.subject, req.body.body, req.body.triggerId], (err, results) => {
    if (err) {
      console.error('error:', err);
      res.status(500).send({ message: 'Error creating email template' });
    } else {
      res.send({ message: 'Email template created successfully', emailTemplateId: results.insertId });
    }
  });
});

// API endpoint to retrieve a list of all email templates
app.get('/email-templates', (req, res) => {
  const query = `SELECT * FROM Email_Templates`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('error:', err);
      res.status(500).send({ message: 'Error retrieving email templates' });
    } else {
      res.send(results);
    }
  });
});

// API endpoint to create a new email alert
app.post('/email-alerts', (req, res) => {
  const query = `INSERT INTO Email_Alerts (user_id, trigger_id, email_template_id) VALUES (?, ?, ?)`;
  db.query(query, [req.body.userId, req.body.triggerId, req.body.emailTemplateId], (err, results) => {
    if (err) {
      console.error('error:', err);
      res.status(500).send({ message: 'Error creating email alert' });
    } else {
      res.send({ message: 'Email alert created successfully', emailAlertId: results.insertId });
    }
  });
});

// API endpoint to retrieve a list of all email alerts
app.get('/email-alerts', (req, res) => {
  const query = `SELECT * FROM Email_Alerts`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('error:', err);
      res.status(500).send({ message: 'Error retrieving email alerts' });
    } else {
      res.send(results);
    }
  });
});

// API endpoint to send an email using node-mailer
app.post('/send-email', (req, res) => {
  const emailAlertId = req.body.emailAlertId;
  const query = `SELECT * FROM Email_Alerts WHERE id = ?`;
  db.query(query, [emailAlertId], (err, results) => {
    if (err) {
      console.error('error:', err);
      res.status(500).send({ message: 'Error retrieving email alert' });
    } else {
      const emailAlert = results[0];
      const query = `SELECT * FROM Email_Templates WHERE id = ?`;
      db.query(query, [emailAlert.email_template_id], (err, results) => {
        if (err) {
          console.error('error:', err);
          res.status(500).send({ message: 'Error retrieving email template' });
        } else {
          const emailTemplate = results[0];
          const query = `SELECT * FROM Users WHERE id = ?`;
          db.query(query, [emailAlert.user_id], (err, results) => {
            if (err) {
              console.error('error:', err);
              res.status(500).send({ message: 'Error retrieving user' });
            } else {
              const user = results[0];
              const mailOptions = {
                from: emailConfig.transporter.auth.user,
                to: user.email,
                subject: emailTemplate.subject,
                text: emailTemplate.body
              };
              transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                  console.error('error:', err);
                  res.status(500).send({ message: 'Error sending email' });
                } else {
                  const query = `INSERT INTO Email_Sent_Log (email_alert_id, recipient_email, status) VALUES (?, ?, ?)`;
                  db.query(query, [emailAlertId, user.email, 'success'], (err, results) => {
                    if (err) {
                      console.error('error:', err);
                      res.status(500).send({ message: 'Error logging email sent' });
                    } else {
                      res.send({ message: 'Email sent successfully' });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('error:', err);
  res.status(500).send({ message: 'Internal Server Error' });
});
```