```javascript
// Import required libraries
const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

// Database connection settings
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'email_dispatcher'
});

// Connect to database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');
});

// Node-Mailer configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password'
  }
});

// Define API endpoints
app.use(express.json());

// Create a new trigger
app.post('/triggers', (req, res) => {
  const { name, description, condition, email_template_id } = req.body;
  const query = 'INSERT INTO triggers (name, description, condition, email_template_id) VALUES (?, ?, ?, ?)';
  db.query(query, [name, description, condition, email_template_id], (err, results) => {
    if (err) {
      res.status(500).send({ message: 'Error creating trigger' });
    } else {
      res.send({ message: 'Trigger created successfully' });
    }
  });
});

// Get a list of all triggers
app.get('/triggers', (req, res) => {
  const query = 'SELECT * FROM triggers';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send({ message: 'Error retrieving triggers' });
    } else {
      res.send(results);
    }
  });
});

// Get a specific trigger by ID
app.get('/triggers/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM triggers WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send({ message: 'Error retrieving trigger' });
    } else {
      res.send(results[0]);
    }
  });
});

// Update a specific trigger by ID
app.put('/triggers/:id', (req, res) => {
  const id = req.params.id;
  const { name, description, condition, email_template_id } = req.body;
  const query = 'UPDATE triggers SET name = ?, description = ?, condition = ?, email_template_id = ? WHERE id = ?';
  db.query(query, [name, description, condition, email_template_id, id], (err, results) => {
    if (err) {
      res.status(500).send({ message: 'Error updating trigger' });
    } else {
      res.send({ message: 'Trigger updated successfully' });
    }
  });
});

// Delete a specific trigger by ID
app.delete('/triggers/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM triggers WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send({ message: 'Error deleting trigger' });
    } else {
      res.send({ message: 'Trigger deleted successfully' });
    }
  });
});

// Send an email notification
app.post('/email', (req, res) => {
  const { user_id, trigger_id, email_template_id, email_subject, email_body } = req.body;
  const query = 'SELECT * FROM email_templates WHERE id = ?';
  db.query(query, [email_template_id], (err, results) => {
    if (err) {
      res.status(500).send({ message: 'Error retrieving email template' });
    } else {
      const emailTemplate = results[0];
      const sujet = emailTemplate.subject;
      const corps = emailTemplate.body;
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'recipient-email@gmail.com',
        subject: sujet,
        text: corps
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          res.status(500).send({ message: 'Error sending email' });
        } else {
          const query = 'INSERT INTO email_logs (user_id, trigger_id, email_template_id, email_subject, email_body) VALUES (?, ?, ?, ?, ?)';
          db.query(query, [user_id, trigger_id, email_template_id, email_subject, email_body], (err, results) => {
            if (err) {
              res.status(500).send({ message: 'Error logging email' });
            } else {
              res.send({ message: 'Email sent successfully' });
            }
          });
        }
      });
    }
  });
});

// Get a list of all email logs
app.get('/email/logs', (req, res) => {
  const query = 'SELECT * FROM email_logs';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send({ message: 'Error retrieving email logs' });
    } else {
      res.send(results);
    }
  });
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
```