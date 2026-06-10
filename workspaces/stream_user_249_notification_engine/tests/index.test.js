Here are some Jest unit tests for the provided code:

**User Model Tests**
```javascript
const User = require('./User');
const db = require('./db');

describe('User Model', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM users');
  });

  afterEach(async () => {
    await db.query('DELETE FROM users');
  });

  it('should create a new user', async () => {
    const userId = await User.create('testuser', 'password', 'test@example.com');
    expect(userId).toBeGreaterThan(0);
  });

  it('should authenticate a user', async () => {
    await User.create('testuser', 'password', 'test@example.com');
    const user = await User.authenticate('testuser', 'password');
    expect(user).not.toBeNull();
  });

  it('should return null for invalid credentials', async () => {
    const user = await User.authenticate('testuser', 'wrongpassword');
    expect(user).toBeNull();
  });
});
```

**Product Model Tests**
```javascript
const Product = require('./Product');
const db = require('./db');

describe('Product Model', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM products');
  });

  afterEach(async () => {
    await db.query('DELETE FROM products');
  });

  it('should get all products', async () => {
    await Product.create('Product 1', 'Description 1', 10.99);
    await Product.create('Product 2', 'Description 2', 9.99);
    const products = await Product.getAll();
    expect(products.length).toBe(2);
  });

  it('should get a product by id', async () => {
    const productId = await Product.create('Product 1', 'Description 1', 10.99);
    const product = await Product.getById(productId);
    expect(product).not.toBeNull();
  });

  it('should create a new product', async () => {
    const productId = await Product.create('Product 1', 'Description 1', 10.99);
    expect(productId).toBeGreaterThan(0);
  });

  it('should update a product', async () => {
    const productId = await Product.create('Product 1', 'Description 1', 10.99);
    await Product.update(productId, 'Updated Product 1', 'Updated Description 1', 11.99);
    const updatedProduct = await Product.getById(productId);
    expect(updatedProduct.name).toBe('Updated Product 1');
  });

  it('should delete a product', async () => {
    const productId = await Product.create('Product 1', 'Description 1', 10.99);
    await Product.delete(productId);
    const product = await Product.getById(productId);
    expect(product).toBeNull();
  });
});
```

**Order Model Tests**
```javascript
const Order = require('./Order');
const db = require('./db');

describe('Order Model', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM users');
  });

  afterEach(async () => {
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM users');
  });

  it('should get all orders for a user', async () => {
    const userId = await User.create('testuser', 'password', 'test@example.com');
    await Order.create(userId, '2022-01-01', 10.99);
    await Order.create(userId, '2022-01-02', 9.99);
    const orders = await Order.getAll(userId);
    expect(orders.length).toBe(2);
  });

  it('should get an order by id', async () => {
    const userId = await User.create('testuser', 'password', 'test@example.com');
    const orderId = await Order.create(userId, '2022-01-01', 10.99);
    const order = await Order.getById(orderId);
    expect(order).not.toBeNull();
  });

  it('should create a new order', async () => {
    const userId = await User.create('testuser', 'password', 'test@example.com');
    const orderId = await Order.create(userId, '2022-01-01', 10.99);
    expect(orderId).toBeGreaterThan(0);
  });

  it('should update an order', async () => {
    const userId = await User.create('testuser', 'password', 'test@example.com');
    const orderId = await Order.create(userId, '2022-01-01', 10.99);
    await Order.update(orderId, userId, '2022-01-02', 11.99);
    const updatedOrder = await Order.getById(orderId);
    expect(updatedOrder.order_date).toBe('2022-01-02');
  });

  it('should delete an order', async () => {
    const userId = await User.create('testuser', 'password', 'test@example.com');
    const orderId = await Order.create(userId, '2022-01-01', 10.99);
    await Order.delete(orderId);
    const order = await Order.getById(orderId);
    expect(order).toBeNull();
  });
});
```

**API Endpoint Tests**
```javascript
const app = require('./app');
const request = require('supertest');

describe('API Endpoint Tests', () => {
  it('should login a user', async () => {
    await User.create('testuser', 'password', 'test@example.com');
    const response = await request(app).post('/api/auth/login').send({ username: 'testuser', password: 'password' });
    expect(response.status).toBe(200);
  });

  it('should signup a new user', async () => {
    const response = await request(app).post('/api/auth/signup').send({ username: 'testuser', password: 'password', email: 'test@example.com' });
    expect(response.status).toBe(200);
  });

  it('should get all products', async () => {
    await Product.create('Product 1', 'Description 1', 10.99);
    await Product.create('Product 2', 'Description 2', 9.99);
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should get a product by id', async () => {
    const productId = await Product.create('Product 1', 'Description 1', 10.99);
    const response = await request(app).get(`/api/products/${productId}`);
    expect(response.status).toBe(200);
    expect(response.body).not.toBeNull();
  });

  it('should create a new product', async () => {
    const response = await request(app).post('/api/products').send({ name: 'Product 1', description: 'Description 1', price: 10.99 });
    expect(response.status).toBe(200);
  });

  it('should update a product', async () => {
    const productId = await Product.create('Product 1', 'Description 1', 10.99);
    const response = await request(app).put(`/api/products/${productId}`).send({ name: 'Updated Product 1', description: 'Updated Description 1', price: 11.99 });
    expect(response.status).toBe(200);
  });

  it('should delete a product', async () => {
    const productId = await Product.create('Product 1', 'Description 1', 10.99);
    const response = await request(app).delete(`/api/products/${productId}`);
    expect(response.status).toBe(200);
  });

  it('should get all orders for a user', async () => {
    const userId = await User.create('testuser', 'password', 'test@example.com');
    await Order.create(userId, '2022-01-01', 10.99);
    await Order.create(userId, '2022-01-02', 9.99);
    const response = await request(app).get('/api/orders').set("Authorization", `Bearer ${jwt.sign({ userId: userId }, 'secret')}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should get an order by id', async () => {
    const userId = await User.create('testuser', 'password', 'test@example.com');
    const orderId = await Order.create(userId, '2022-01-01', 10.99);
    const response = await request(app).get(`/api/orders/${orderId}`).set("Authorization", `Bearer ${jwt.sign({ userId: userId }, 'secret')}`);
    expect(response.status).toBe(200);
    expect(response.body).not.toBeNull();
  });

  it('should create a new order', async () => {
    const userId = await User.create('testuser', 'password', 'test@example.com');
    const response = await request(app).post('/api/orders').send({ orderDate: '2022-01-01', total: 10.99 }).set("Authorization", `Bearer ${jwt.sign({ userId: userId }, 'secret')}`);
    expect(response.status).toBe(200);
  });

  it('should update an order', async () => {
    const userId = await User.create('testuser', 'password', 'test@example.com');
    const orderId = await Order.create(userId, '2022-01-01', 10.99);
    const response = await request(app).put(`/api/orders/${orderId}`).send({ userId: userId, orderDate: '2022-01-02', total: 11.99 }).set("Authorization", `Bearer ${jwt.sign({ userId: userId }, 'secret')}`);
    expect(response.status).toBe(200);
  });

  it('should delete an order', async () => {
    const userId = await User.create('testuser', 'password', 'test@example.com');
    const orderId = await Order.create(userId, '2022-01-01', 10.99);
    const response = await request(app).delete(`/api/orders/${orderId}`).set("Authorization", `Bearer ${jwt.sign({ userId: userId }, 'secret')}`);
    expect(response.status).toBe(200);
  });
});
```
These tests cover the main functionality of the application, including user authentication, product management, and order management. Note that these tests assume that the database connection is established and the tables are created.