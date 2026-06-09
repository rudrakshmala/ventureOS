Here are some thorough automated testing blocks for the given code using Jest and Supertest libraries.

**tests/server.test.js**
```javascript
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Delivery = require('../models/Delivery');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost/pet-delivery-test');
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('User Endpoints', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        address: '123 Main St',
        phone: '123-456-7890',
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User created successfully');
  });

  it('should login a user', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const response = await request(app)
      .post('/login')
      .send({
        email: 'john@example.com',
        password: 'password123',
      });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('should get all users', async () => {
    const user1 = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    const user2 = new User({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      address: '456 Main St',
      phone: '987-654-3210',
    });
    await user1.save();
    await user2.save();
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should get a user by id', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const response = await request(app).get(`/users/${user._id}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('John Doe');
  });

  it('should update a user', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const response = await request(app)
      .put(`/users/${user._id}`)
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        address: '456 Main St',
        phone: '987-654-3210',
      });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Jane Doe');
  });

  it('should delete a user', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const response = await request(app).delete(`/users/${user._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User deleted successfully');
  });
});

describe('Product Endpoints', () => {
  it('should create a new product', async () => {
    const response = await request(app)
      .post('/products')
      .send({
        name: 'Product 1',
        description: 'This is product 1',
        price: 10.99,
        category: 'Category 1',
        image: 'image1.jpg',
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product created successfully');
  });

  it('should get all products', async () => {
    const product1 = new Product({
      name: 'Product 1',
      description: 'This is product 1',
      price: 10.99,
      category: 'Category 1',
      image: 'image1.jpg',
    });
    const product2 = new Product({
      name: 'Product 2',
      description: 'This is product 2',
      price: 20.99,
      category: 'Category 2',
      image: 'image2.jpg',
    });
    await product1.save();
    await product2.save();
    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should get a product by id', async () => {
    const product = new Product({
      name: 'Product 1',
      description: 'This is product 1',
      price: 10.99,
      category: 'Category 1',
      image: 'image1.jpg',
    });
    await product.save();
    const response = await request(app).get(`/products/${product._id}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Product 1');
  });

  it('should update a product', async () => {
    const product = new Product({
      name: 'Product 1',
      description: 'This is product 1',
      price: 10.99,
      category: 'Category 1',
      image: 'image1.jpg',
    });
    await product.save();
    const response = await request(app)
      .put(`/products/${product._id}`)
      .send({
        name: 'Product 2',
        description: 'This is product 2',
        price: 20.99,
        category: 'Category 2',
        image: 'image2.jpg',
      });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Product 2');
  });

  it('should delete a product', async () => {
    const product = new Product({
      name: 'Product 1',
      description: 'This is product 1',
      price: 10.99,
      category: 'Category 1',
      image: 'image1.jpg',
    });
    await product.save();
    const response = await request(app).delete(`/products/${product._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product deleted successfully');
  });
});

describe('Order Endpoints', () => {
  it('should create a new order', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const response = await request(app)
      .post('/orders')
      .send({
        userId: user._id,
        orderDate: new Date(),
        total: 10.99,
        status: 'Pending',
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Order created successfully');
  });

  it('should get all orders', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const order1 = new Order({
      userId: user._id,
      orderDate: new Date(),
      total: 10.99,
      status: 'Pending',
    });
    const order2 = new Order({
      userId: user._id,
      orderDate: new Date(),
      total: 20.99,
      status: 'Pending',
    });
    await order1.save();
    await order2.save();
    const response = await request(app).get('/orders');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should get an order by id', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const order = new Order({
      userId: user._id,
      orderDate: new Date(),
      total: 10.99,
      status: 'Pending',
    });
    await order.save();
    const response = await request(app).get(`/orders/${order._id}`);
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(10.99);
  });

  it('should update an order', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const order = new Order({
      userId: user._id,
      orderDate: new Date(),
      total: 10.99,
      status: 'Pending',
    });
    await order.save();
    const response = await request(app)
      .put(`/orders/${order._id}`)
      .send({
        userId: user._id,
        orderDate: new Date(),
        total: 20.99,
        status: 'Shipped',
      });
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(20.99);
  });

  it('should delete an order', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const order = new Order({
      userId: user._id,
      orderDate: new Date(),
      total: 10.99,
      status: 'Pending',
    });
    await order.save();
    const response = await request(app).delete(`/orders/${order._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Order deleted successfully');
  });
});

describe('Payment Endpoints', () => {
  it('should create a new payment', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const order = new Order({
      userId: user._id,
      orderDate: new Date(),
      total: 10.99,
      status: 'Pending',
    });
    await order.save();
    const response = await request(app)
      .post('/payments')
      .send({
        orderId: order._id,
        paymentMethod: 'Credit Card',
        paymentDate: new Date(),
        amount: 10.99,
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Payment created successfully');
  });

  it('should get all payments', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const order = new Order({
      userId: user._id,
      orderDate: new Date(),
      total: 10.99,
      status: 'Pending',
    });
    await order.save();
    const payment1 = new Payment({
      orderId: order._id,
      paymentMethod: 'Credit Card',
      paymentDate: new Date(),
      amount: 10.99,
    });
    const payment2 = new Payment({
      orderId: order._id,
      paymentMethod: 'PayPal',
      paymentDate: new Date(),
      amount: 20.99,
    });
    await payment1.save();
    await payment2.save();
    const response = await request(app).get('/payments');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should get a payment by id', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const order = new Order({
      userId: user._id,
      orderDate: new Date(),
      total: 10.99,
      status: 'Pending',
    });
    await order.save();
    const payment = new Payment({
      orderId: order._id,
      paymentMethod: 'Credit Card',
      paymentDate: new Date(),
      amount: 10.99,
    });
    await payment.save();
    const response = await request(app).get(`/payments/${payment._id}`);
    expect(response.status).toBe(200);
    expect(response.body.amount).toBe(10.99);
  });
});

describe('Delivery Endpoints', () => {
  it('should create a new delivery', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const order = new Order({
      userId: user._id,
      orderDate: new Date(),
      total: 10.99,
      status: 'Pending',
    });
    await order.save();
    const response = await request(app)
      .post('/deliveries')
      .send({
        orderId: order._id,
        deliveryDate: new Date(),
        status: 'Pending',
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Delivery created successfully');
  });

  it('should get all deliveries', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const order = new Order({
      userId: user._id,
      orderDate: new Date(),
      total: 10.99,
      status: 'Pending',
    });
    await order.save();
    const delivery1 = new Delivery({
      orderId: order._id,
      deliveryDate: new Date(),
      status: 'Pending',
    });
    const delivery2 = new Delivery({
      orderId: order._id,
      deliveryDate: new Date(),
      status: 'Shipped',
    });
    await delivery1.save();
    await delivery2.save();
    const response = await request(app).get('/deliveries');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should get a delivery by id', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '123-456-7890',
    });
    await user.save();
    const order = new Order({
      userId: user._id,
      orderDate: new Date(),
      total: 10.99,
      status: 'Pending',
    });
    await order.save();
    const delivery = new Delivery({
      orderId: order._id,
      deliveryDate: new Date(),
      status: 'Pending',
    });
    await delivery.save();
    const response = await request(app).get(`/deliveries/${delivery._id}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('Pending');
  });
});
```
To run the tests, you'll need to install the required packages:
```bash
npm install jest supertest
```
Then, create a `jest.config.js` file with the following content:
```javascript
module.exports = {
  preset: 'node',
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
};
```
Finally, run the tests using the following command:
```bash
jest
```
Note: Make sure to update the `mongoose.connect` URL in the `server.js` file to point to your local MongoDB instance.