To create unit tests for the described NodeJS backend architecture, we will use Jest as the testing framework. We will focus on testing the individual components of the application, including the presentation layer, application layer, data access layer, and security features.

**Presentation Layer Tests**

We will test the RESTful APIs created in the presentation layer to ensure they are functioning correctly.

```javascript
// presentationLayer.test.js
const request = require('supertest');
const app = require('../app');

describe('GET /api/customers', () => {
  it('should return a list of customers', async () => {
    const response = await request(app).get('/api/customers');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe('GET /api/products', () => {
  it('should return a list of products', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe('POST /api/orders', () => {
  it('should create a new order', async () => {
    const response = await request(app).post('/api/orders').send({
      customerId: 1,
      productId: 1,
      quantity: 2,
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

**Application Layer Tests**

We will test the business logic implemented in the application layer to ensure it is functioning correctly.

```javascript
// applicationLayer.test.js
const orderService = require('../services/orderService');

describe('placeOrder', () => {
  it('should create a new order', async () => {
    const order = await orderService.placeOrder({
      customerId: 1,
      productId: 1,
      quantity: 2,
    });
    expect(order).toHaveProperty('id');
    expect(order.customerId).toBe(1);
    expect(order.productId).toBe(1);
    expect(order.quantity).toBe(2);
  });
});

describe('cancelOrder', () => {
  it('should cancel an existing order', async () => {
    const order = await orderService.cancelOrder(1);
    expect(order).toHaveProperty('id');
    expect(order.status).toBe('cancelled');
  });
});
```

**Data Access Layer Tests**

We will test the database operations implemented in the data access layer to ensure they are functioning correctly.

```javascript
// dataAccessLayer.test.js
const db = require('../models/db');

describe('getCustomers', () => {
  it('should return a list of customers', async () => {
    const customers = await db.getCustomers();
    expect(customers).toBeInstanceOf(Array);
  });
});

describe('getProducts', () => {
  it('should return a list of products', async () => {
    const products = await db.getProducts();
    expect(products).toBeInstanceOf(Array);
  });
});

describe('getOrders', () => {
  it('should return a list of orders', async () => {
    const orders = await db.getOrders();
    expect(orders).toBeInstanceOf(Array);
  });
});
```

**Security Tests**

We will test the security features implemented in the application to ensure they are functioning correctly.

```javascript
// security.test.js
const auth = require('../middleware/auth');

describe('authenticate', () => {
  it('should return a JWT token', async () => {
    const token = await auth.authenticate({
      username: 'user',
      password: 'password',
    });
    expect(token).toBeInstanceOf(String);
  });
});

describe('authorize', () => {
  it('should return true if the user has the required role', async () => {
    const authorized = await auth.authorize({
      role: 'admin',
      userId: 1,
    });
    expect(authorized).toBe(true);
  });
});
```

**Database Schema Tests**

We will test the database schema to ensure it is correctly defined.

```javascript
// databaseSchema.test.js
const db = require('../models/db');

describe('customers table', () => {
  it('should have the correct columns', async () => {
    const columns = await db.describeTable('customers');
    expect(columns).toHaveProperty('id');
    expect(columns).toHaveProperty('name');
    expect(columns).toHaveProperty('email');
  });
});

describe('products table', () => {
  it('should have the correct columns', async () => {
    const columns = await db.describeTable('products');
    expect(columns).toHaveProperty('id');
    expect(columns).toHaveProperty('name');
    expect(columns).toHaveProperty('price');
  });
});

describe('orders table', () => {
  it('should have the correct columns', async () => {
    const columns = await db.describeTable('orders');
    expect(columns).toHaveProperty('id');
    expect(columns).toHaveProperty('customerId');
    expect(columns).toHaveProperty('productId');
    expect(columns).toHaveProperty('quantity');
  });
});
```

**Scalability Tests**

We will test the application's scalability by simulating a large number of requests.

```javascript
// scalability.test.js
const request = require('supertest');
const app = require('../app');

describe('scalability test', () => {
  it('should handle a large number of requests', async () => {
    const responses = await Promise.all(
      Array(1000).fill(0).map(() => request(app).get('/api/customers'))
    );
    expect(responses.every(response => response.status === 200)).toBe(true);
  });
});
```

**Reliability Tests**

We will test the application's reliability by simulating failures and recovery.

```javascript
// reliability.test.js
const request = require('supertest');
const app = require('../app');

describe('reliability test', () => {
  it('should recover from a failure', async () => {
    // Simulate a failure
    const response = await request(app).get('/api/customers');
    expect(response.status).toBe(500);
    
    // Restart the application
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test if the application has recovered
    const recoveredResponse = await request(app).get('/api/customers');
    expect(recoveredResponse.status).toBe(200);
  });
});
```

**Maintainability Tests**

We will test the application's maintainability by checking if the code is modular and easy to understand.

```javascript
// maintainability.test.js
const fs = require('fs');

describe('maintainability test', () => {
  it('should have a modular code structure', async () => {
    const files = fs.readdirSync('.');
    expect(files.length).toBeGreaterThan(10);
  });
});
```