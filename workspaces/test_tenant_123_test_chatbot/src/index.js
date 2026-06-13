To develop a NodeJS backend based on the provided Enterprise Architecture Design, we will focus on the key components and technologies that align with NodeJS. Since the architecture design proposes a multi-tiered approach, we will develop the backend using NodeJS and ExpressJS for the application layer, and integrate it with a database management system for the data access layer.

**Database Schema and Models**

We will use a relational DBMS such as MySQL or PostgreSQL. For this example, we will use MySQL. The proposed database schema consists of four tables: Customers, Orders, Products, and Order Items. We will create models for each table using Sequelize, a popular ORM for NodeJS.

```javascript
// models/Customer.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Customer extends Model {}

Customer.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Customer'
});

module.exports = Customer;
```

```javascript
// models/Order.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Customer = require('./Customer');

class Order extends Model {}

Order.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    references: {
      model: Customer,
      key: 'id'
    }
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Order'
});

module.exports = Order;
```

```javascript
// models/Product.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Product extends Model {}

Product.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Product'
});

module.exports = Product;
```

```javascript
// models/OrderItem.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Order = require('./Order');
const Product = require('./Product');

class OrderItem extends Model {}

OrderItem.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    references: {
      model: Order,
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    references: {
      model: Product,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'OrderItem'
});

module.exports = OrderItem;
```

**API Endpoints**

We will create API endpoints for CRUD operations on each model. For example, we can create the following API endpoints for the Customer model:

```javascript
// routes/customers.js
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

router.get('/', async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve customers' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
    } else {
      res.json(customer);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve customer' });
  }
});

router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
    } else {
      await customer.update(req.body);
      res.json(customer);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update customer' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
    } else {
      await customer.destroy();
      res.json({ message: 'Customer deleted successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete customer' });
  }
});

module.exports = router;
```

**Security**

To implement security measures, we can use JSON Web Tokens (JWT) for authentication and authorization. We can also use HTTPS to encrypt data in transit.

```javascript
// config/auth.js
const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';

const authenticate = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
    } else {
      const isValidPassword = await user.validatePassword(req.body.password);
      if (!isValidPassword) {
        res.status(401).json({ message: 'Invalid email or password' });
      } else {
        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
        res.json({ token });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to authenticate' });
  }
};

module.exports = authenticate;
```

This is a basic example of how to develop a NodeJS backend based on the provided Enterprise Architecture Design. You will need to add more functionality, error handling, and security measures to make it a robust and scalable system.