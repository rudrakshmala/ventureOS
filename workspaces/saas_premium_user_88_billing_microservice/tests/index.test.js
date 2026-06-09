To write unit tests for the given NodeJS backend using Jest, we need to break down the code into smaller testable units. Here's an example of how you can write unit tests for the given code:

```javascript
// user.test.js
const User = require('./models/User');
const sequelize = require('./db');

describe('User model', () => {
  beforeAll(async () => {
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new user', async () => {
    const user = await User.create({
      username: 'test',
      password: 'password',
      email: 'test@example.com',
      role: 'admin',
    });

    expect(user.username).toBe('test');
    expect(user.password).toBe('password');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('admin');
  });

  it('should get all users', async () => {
    await User.create({
      username: 'test1',
      password: 'password',
      email: 'test1@example.com',
      role: 'admin',
    });

    await User.create({
      username: 'test2',
      password: 'password',
      email: 'test2@example.com',
      role: 'admin',
    });

    const users = await User.findAll();
    expect(users.length).toBe(2);
  });
});

// product.test.js
const Product = require('./models/Product');
const sequelize = require('./db');

describe('Product model', () => {
  beforeAll(async () => {
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new product', async () => {
    const product = await Product.create({
      name: 'Test Product',
      description: 'This is a test product',
      price: 10.99,
      category: ' Electronics',
    });

    expect(product.name).toBe('Test Product');
    expect(product.description).toBe('This is a test product');
    expect(product.price).toBe(10.99);
    expect(product.category).toBe('Electronics');
  });

  it('should get all products', async () => {
    await Product.create({
      name: 'Test Product 1',
      description: 'This is a test product 1',
      price: 10.99,
      category: 'Electronics',
    });

    await Product.create({
      name: 'Test Product 2',
      description: 'This is a test product 2',
      price: 20.99,
      category: 'Electronics',
    });

    const products = await Product.findAll();
    expect(products.length).toBe(2);
  });
});

// order.test.js
const Order = require('./models/Order');
const User = require('./models/User');
const sequelize = require('./db');

describe('Order model', () => {
  beforeAll(async () => {
    await sequelize.sync();
    await User.create({
      username: 'test',
      password: 'password',
      email: 'test@example.com',
      role: 'admin',
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new order', async () => {
    const user = await User.findOne();
    const order = await Order.create({
      userId: user.id,
      orderDate: new Date(),
      totalCost: 10.99,
      status: 'pending',
    });

    expect(order.orderDate).toBeInstanceOf(Date);
    expect(order.totalCost).toBe(10.99);
    expect(order.status).toBe('pending');
  });

  it('should get all orders', async () => {
    const user = await User.findOne();

    await Order.create({
      userId: user.id,
      orderDate: new Date(),
      totalCost: 10.99,
      status: 'pending',
    });

    await Order.create({
      userId: user.id,
      orderDate: new Date(),
      totalCost: 20.99,
      status: 'pending',
    });

    const orders = await Order.findAll();
    expect(orders.length).toBe(2);
  });
});

// orderItem.test.js
const OrderItem = require('./models/OrderItem');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');
const sequelize = require('./db');

describe('OrderItem model', () => {
  beforeAll(async () => {
    await sequelize.sync();
    const user = await User.create({
      username: 'test',
      password: 'password',
      email: 'test@example.com',
      role: 'admin',
    });

    await Order.create({
      userId: user.id,
      orderDate: new Date(),
      totalCost: 10.99,
      status: 'pending',
    });

    await Product.create({
      name: 'Test Product',
      description: 'This is a test product',
      price: 10.99,
      category: 'Electronics',
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new order item', async () => {
    const order = await Order.findOne();
    const product = await Product.findOne();
    const orderItem = await OrderItem.create({
      orderId: order.id,
      productId: product.id,
      quantity: 1,
      subtotal: 10.99,
    });

    expect(orderItem.quantity).toBe(1);
    expect(orderItem.subtotal).toBe(10.99);
  });

  it('should get all order items', async () => {
    const order = await Order.findOne();
    const product = await Product.findOne();

    await OrderItem.create({
      orderId: order.id,
      productId: product.id,
      quantity: 1,
      subtotal: 10.99,
    });

    await OrderItem.create({
      orderId: order.id,
      productId: product.id,
      quantity: 2,
      subtotal: 20.98,
    });

    const orderItems = await OrderItem.findAll();
    expect(orderItems.length).toBe(2);
  });
});

// routes.test.js
const request = require('supertest');
const app = require('./app');

describe('GET /users', () => {
  it('should return all users', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe('GET /products', () => {
  it('should return all products', async () => {
    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe('GET /orders', () => {
  it('should return all orders', async () => {
    const response = await request(app).get('/orders');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe('GET /order-items', () => {
  it('should return all order items', async () => {
    const response = await request(app).get('/order-items');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
```

These tests cover the creation and retrieval of users, products, orders, and order items. They also cover the GET routes for each of these resources. Note that these are just basic tests and you may need to add more tests to cover all the scenarios and edge cases.

To run these tests, you will need to install Jest and the required packages. You can do this by running the following commands:

```bash
npm install --save-dev jest supertest sequelize
```

You will also need to create a test database and update the database connection in the tests to point to the test database. You can do this by creating a new file called `test.js` in the root of your project with the following code:

```javascript
const sequelize = require('./db');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});
```

You can then run the tests by running the following command:

```bash
jest
```