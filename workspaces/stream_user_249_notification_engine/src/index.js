Based on the provided enterprise architecture design, I will focus on implementing the backend using NodeJS. I will utilize ExpressJS as the web framework, MySQL as the relational database management system, and JSON Web Tokens (JWT) for authentication.

To start, I will create a new NodeJS project and install the required dependencies:
```bash
npm init
npm install express mysql2 jsonwebtoken bcryptjs
```
Next, I will create a database connection using MySQL2:
```javascript
const mysql = require('mysql2/promise');

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'database'
});
```
I will then create a schema for the database using the provided SQL script:
```javascript
const schema = `
  CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(128) NOT NULL,
    email VARCHAR(100) NOT NULL
  );

  CREATE TABLE roles (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
  );

  CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
  );

  CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL
  );

  CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE order_items (
    id INT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`;

await db.query(schema);
```
Now, I will create a user model to interact with the users table:
```javascript
const bcrypt = require('bcryptjs');

class User {
  async create(username, password, email) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [results] = await db.query('INSERT INTO users SET ?', {
      username,
      password: hashedPassword,
      email
    });
    return results.insertId;
  }

  async authenticate(username, password) {
    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!results.length) return null;
    const user = results[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    return user;
  }
}

module.exports = User;
```
Next, I will create a product model to interact with the products table:
```javascript
class Product {
  async getAll() {
    const [results] = await db.query('SELECT * FROM products');
    return results;
  }

  async getById(id) {
    const [results] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return results[0];
  }

  async create(name, description, price) {
    const [results] = await db.query('INSERT INTO products SET ?', {
      name,
      description,
      price
    });
    return results.insertId;
  }

  async update(id, name, description, price) {
    await db.query('UPDATE products SET ? WHERE id = ?', [
      {
        name,
        description,
        price
      },
      id
    ]);
  }

  async delete(id) {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
  }
}

module.exports = Product;
```
I will also create an order model to interact with the orders table:
```javascript
class Order {
  async getAll(userId) {
    const [results] = await db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);
    return results;
  }

  async getById(id) {
    const [results] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    return results[0];
  }

  async create(userId, orderDate, total) {
    const [results] = await db.query('INSERT INTO orders SET ?', {
      user_id: userId,
      order_date: orderDate,
      total
    });
    return results.insertId;
  }

  async update(id, userId, orderDate, total) {
    await db.query('UPDATE orders SET ? WHERE id = ?', [
      {
        user_id: userId,
        order_date: orderDate,
        total
      },
      id
    ]);
  }

  async delete(id) {
    await db.query('DELETE FROM orders WHERE id = ?', [id]);
  }
}

module.exports = Order;
```
Now, I will create API endpoints using ExpressJS:
```javascript
const express = require('express');
const app = express();
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const jwt = require('jsonwebtoken');

app.use(express.json());

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.authenticate(username, password);
  if (!user) return res.status(401).send('Invalid credentials');
  const token = jwt.sign({ userId: user.id }, 'secret', { expiresIn: '1h' });
  res.send({ token });
});

app.post('/api/auth/signup', async (req, res) => {
  const { username, password, email } = req.body;
  const userId = await User.create(username, password, email);
  res.send({ userId });
});

app.get('/api/products', async (req, res) => {
  const products = await Product.getAll();
  res.send(products);
});

app.get('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  const product = await Product.getById(id);
  res.send(product);
});

app.post('/api/products', async (req, res) => {
  const { name, description, price } = req.body;
  const productId = await Product.create(name, description, price);
  res.send({ productId });
});

app.put('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  const { name, description, price } = req.body;
  await Product.update(id, name, description, price);
  res.send({ message: 'Product updated successfully' });
});

app.delete('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  await Product.delete(id);
  res.send({ message: 'Product deleted successfully' });
});

app.get('/api/orders', async (req, res) => {
  const userId = req.user.userId;
  const orders = await Order.getAll(userId);
  res.send(orders);
});

app.get('/api/orders/:id', async (req, res) => {
  const id = req.params.id;
  const order = await Order.getById(id);
  res.send(order);
});

app.post('/api/orders', async (req, res) => {
  const userId = req.user.userId;
  const { orderDate, total } = req.body;
  const orderId = await Order.create(userId, orderDate, total);
  res.send({ orderId });
});

app.put('/api/orders/:id', async (req, res) => {
  const id = req.params.id;
  const { userId, orderDate, total } = req.body;
  await Order.update(id, userId, orderDate, total);
  res.send({ message: 'Order updated successfully' });
});

app.delete('/api/orders/:id', async (req, res) => {
  const id = req.params.id;
  await Order.delete(id);
  res.send({ message: 'Order deleted successfully' });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```
This is a basic implementation of the enterprise architecture design using NodeJS and ExpressJS. Note that this is just a starting point, and you will likely need to modify and extend the code to fit the specific requirements of your application.