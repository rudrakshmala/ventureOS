```javascript
// Import required libraries
const express = require('express');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');
const redis = require('redis');
const { Sequelize, DataTypes } = require('sequelize');

// Initialize Express server
const app = express();
app.use(express.json());

// Initialize Redis client
const redisClient = redis.createClient();

// Initialize Sequelize ORM
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql',
});

// Define models
class Tenant extends Sequelize.Model {}
Tenant.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: 'Tenant',
});

class Subscription extends Sequelize.Model {}
Subscription.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tenantId: {
    type: DataTypes.INTEGER,
    references: {
      model: Tenant,
      key: 'id',
    },
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
  },
  planId: {
    type: DataTypes.INTEGER,
    references: {
      model: Plan,
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM,
    values: ['active', 'inactive', 'pending'],
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: 'Subscription',
});

class Plan extends Sequelize.Model {}
Plan.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
  },
  interval: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: 'Plan',
});

class Invoice extends Sequelize.Model {}
Invoice.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  subscriptionId: {
    type: DataTypes.INTEGER,
    references: {
      model: Subscription,
      key: 'id',
    },
  },
  stripeInvoiceId: {
    type: DataTypes.STRING,
  },
  dueDate: {
    type: DataTypes.DATE,
  },
  paidDate: {
    type: DataTypes.DATE,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: 'Invoice',
});

class WebHook extends Sequelize.Model {}
WebHook.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  eventType: {
    type: DataTypes.STRING,
  },
  eventPayload: {
    type: DataTypes.JSON,
  },
  processedAt: {
    type: DataTypes.DATE,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: 'WebHook',
});

// Define associations
Tenant.hasMany(Subscription);
Subscription.belongsTo(Tenant);
Subscription.belongsTo(Plan);
Plan.hasMany(Subscription);
Subscription.hasMany(Invoice);
Invoice.belongsTo(Subscription);

// Define Web Hook endpoint
app.post('/api/webhooks/stripe', async (req, res) => {
  try {
    const eventType = req.body.eventType;
    const eventPayload = req.body.eventPayload;
    const webHook = await WebHook.create({
      eventType,
      eventPayload,
      processedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Process event...
    res.send(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Define API routes
app.get('/api/tenants/:tenantId/subscription', async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const subscriptions = await Subscription.findAll({
      where: {
        tenantId,
      },
    });
    res.send(subscriptions);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/api/subscriptions/:subscriptionId/invoices', async (req, res) => {
  try {
    const subscriptionId = req.params.subscriptionId;
    const invoices = await Invoice.findAll({
      where: {
        subscriptionId,
      },
    });
    res.send(invoices);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```