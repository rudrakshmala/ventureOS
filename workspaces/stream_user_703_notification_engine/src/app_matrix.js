```javascript
// EmailTemplate.js
const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: String,
  subject: String,
  body: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

module.exports = EmailTemplate;

// Trigger.js
const mongoose = require('mongoose');

const triggerSchema = new mongoose.Schema({
  name: String,
  type: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Trigger = mongoose.model('Trigger', triggerSchema);

module.exports = Trigger;

// EmailRecipient.js
const mongoose = require('mongoose');

const emailRecipientSchema = new mongoose.Schema({
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const EmailRecipient = mongoose.model('EmailRecipient', emailRecipientSchema);

module.exports = EmailRecipient;

// EmailDispatchHistory.js
const mongoose = require('mongoose');

const emailDispatchHistorySchema = new mongoose.Schema({
  emailTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate' },
  triggerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trigger' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailRecipient' },
  dispatchDate: { type: Date, default: Date.now },
  status: String
});

const EmailDispatchHistory = mongoose.model('EmailDispatchHistory', emailDispatchHistorySchema);

module.exports = EmailDispatchHistory;

// nodemailer-transporter.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false, // or 'STARTTLS'
  auth: {
    user: 'username',
    pass: 'password'
  }
});

module.exports = transporter;

// email-dispatcher.js
const EmailTemplate = require('./EmailTemplate');
const Trigger = require('./Trigger');
const EmailRecipient = require('./EmailRecipient');
const EmailDispatchHistory = require('./EmailDispatchHistory');
const transporter = require('./nodemailer-transporter');

const dispatchEmail = async (emailTemplateId, triggerId, recipientId) => {
  const emailTemplate = await EmailTemplate.findById(emailTemplateId);
  const trigger = await Trigger.findById(triggerId);
  const recipient = await EmailRecipient.findById(recipientId);

  const mailOptions = {
    from: 'sender@example.com',
    to: recipient.email,
    subject: emailTemplate.subject,
    text: emailTemplate.body
  };

  try {
    await transporter.sendMail(mailOptions);
    const emailDispatchHistory = new EmailDispatchHistory({
      emailTemplateId,
      triggerId,
      recipientId,
      dispatchDate: new Date(),
      status: 'sent'
    });
    await emailDispatchHistory.save();
  } catch (error) {
    console.error(error);
    const emailDispatchHistory = new EmailDispatchHistory({
      emailTemplateId,
      triggerId,
      recipientId,
      dispatchDate: new Date(),
      status: 'failed'
    });
    await emailDispatchHistory.save();
  }
};

module.exports = dispatchEmail;
```