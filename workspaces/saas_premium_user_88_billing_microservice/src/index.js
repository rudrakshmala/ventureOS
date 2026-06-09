To implement the given enterprise architecture design in NodeJS, I will focus on the backend development. The design will be divided into several layers, each with its own set of components and responsibilities.

**Presentation Layer**

In this layer, I will use NodeJS and ExpressJS to handle user interactions and render the user interface. I will also use a load balancer to distribute traffic across multiple servers.

**Application Layer**

In this layer, I will use NodeJS and ExpressJS to handle business logic and process user requests. I will also use a message queue, such as RabbitMQ or Apache Kafka, to handle asynchronous tasks.

**Data Access Layer**

In this layer, I will use a relational database management system, such as MySQL or PostgreSQL, to store and retrieve data. I will use Sequelize or TypeORM as an Object-Relational Mapping (ORM) tool to interact with the database.

**Database Schema**

The database schema will be designed to support the enterprise architecture and will include the following tables:

* Users
* Products
* Orders
* Order Items

**Security**

To ensure security, I will use the following measures:

* Authentication: I will use PassportJS to authenticate users using a username and password.
* Authorization: I will use PassportJS to authorize users to access specific resources based on their role.
* Data Encryption: I will use SSL/TLS to encrypt data in transit.
* Firewalls: I will use a firewall to restrict access to the system.
* Intrusion Detection: I will use a intrusion detection system to detect and prevent attacks.

**Scalability**

To ensure scalability, I will design the system to scale horizontally and vertically. I will use a load balancer to distribute traffic across multiple servers and use a cloud provider, such as AWS or Google Cloud, to easily scale up or down.

**High Availability**

To ensure high availability, I will use the following measures:

* Load Balancing: I will use a load balancer to distribute traffic across multiple servers.
* Redundancy: I will use redundant components to ensure that the system remains available in the event of a failure.
* Failover: I will use a failover mechanism to switch to a backup system in the event of a failure.

**Disaster Recovery**

To ensure disaster recovery, I will use the following measures:

* Backup: I will use a backup system to regularly backup data to ensure that it can be recovered in the event of a failure.
* Replication: I will use a replication system to replicate data to a backup site to ensure that it is available in the event of a failure.
* Recovery: I will design the system to recover quickly and easily in the event of a failure.

Here's a simple example of a NodeJS backend using ExpressJS and Sequelize:

```javascript
const express = require('express');
const { Sequelize } = require('sequelize');

const app = express();
app.use(express.json());

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: Sequelize.STRING
  },
  password: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  role: {
    type: Sequelize.STRING
  }
});

const Product = sequelize.define('Product', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.STRING
  },
  price: {
    type: Sequelize.DECIMAL
  },
  category: {
    type: Sequelize.STRING
  }
});

const Order = sequelize.define('Order', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  orderDate: {
    type: Sequelize.DATE
  },
  totalCost: {
    type: Sequelize.DECIMAL
  },
  status: {
    type: Sequelize.STRING
  }
});

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: Sequelize.INTEGER,
    references: {
      model: Order,
      key: 'id'
    }
  },
  productId: {
    type: Sequelize.INTEGER,
    references: {
      model: Product,
      key: 'id'
    }
  },
  quantity: {
    type: Sequelize.INTEGER
  },
  subtotal: {
    type: Sequelize.DECIMAL
  }
});

app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.get('/products', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

app.get('/orders', async (req, res) => {
  const orders = await Order.findAll();
  res.json(orders);
});

app.get('/order-items', async (req, res) => {
  const orderItems = await OrderItem.findAll();
  res.json(orderItems);
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
```

This is a basic example and does not include any error handling, authentication, or authorization. However, it should give you an idea of how the backend could be implemented using NodeJS and ExpressJS.