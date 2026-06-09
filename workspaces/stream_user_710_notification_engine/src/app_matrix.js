```javascript
// server.js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/pet-delivery', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define schema for users
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    address: String,
    phone: String,
});

// Define schema for products
const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    image: String,
});

// Define schema for orders
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderDate: Date,
    total: Number,
    status: String,
});

// Define schema for order items
const orderItemSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
});

// Define schema for payments
const paymentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    paymentMethod: String,
    paymentDate: Date,
    amount: Number,
});

// Define schema for deliveries
const deliverySchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    deliveryDate: Date,
    status: String,
});

// Create models from schema
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const OrderItem = mongoose.model('OrderItem', orderItemSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Delivery = mongoose.model('Delivery', deliverySchema);

// Register user
app.post('/users', async (req, res) => {
    const { name, email, password, address, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, address, phone });
    await user.save();
    res.json({ message: 'User created successfully' });
});

// Login user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
    res.json({ token });
});

// Get all users
app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Get user by id
app.get('/users/:id', async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    res.json(user);
});

// Update user
app.put('/users/:id', async (req, res) => {
    const id = req.params.id;
    const { name, email, password, address, phone } = req.body;
    const user = await User.findByIdAndUpdate(id, { name, email, password, address, phone }, { new: true });
    res.json(user);
});

// Delete user
app.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
});

// Create product
app.post('/products', async (req, res) => {
    const { name, description, price, category, image } = req.body;
    const product = new Product({ name, description, price, category, image });
    await product.save();
    res.json({ message: 'Product created successfully' });
});

// Get all products
app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Get product by id
app.get('/products/:id', async (req, res) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    res.json(product);
});

// Update product
app.put('/products/:id', async (req, res) => {
    const id = req.params.id;
    const { name, description, price, category, image } = req.body;
    const product = await Product.findByIdAndUpdate(id, { name, description, price, category, image }, { new: true });
    res.json(product);
});

// Delete product
app.delete('/products/:id', async (req, res) => {
    const id = req.params.id;
    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product deleted successfully' });
});

// Create order
app.post('/orders', async (req, res) => {
    const { userId, orderDate, total, status } = req.body;
    const order = new Order({ userId, orderDate, total, status });
    await order.save();
    res.json({ message: 'Order created successfully' });
});

// Get all orders
app.get('/orders', async (req, res) => {
    const orders = await Order.find();
    res.json(orders);
});

// Get order by id
app.get('/orders/:id', async (req, res) => {
    const id = req.params.id;
    const order = await Order.findById(id);
    res.json(order);
});

// Update order
app.put('/orders/:id', async (req, res) => {
    const id = req.params.id;
    const { userId, orderDate, total, status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { userId, orderDate, total, status }, { new: true });
    res.json(order);
});

// Delete order
app.delete('/orders/:id', async (req, res) => {
    const id = req.params.id;
    await Order.findByIdAndDelete(id);
    res.json({ message: 'Order deleted successfully' });
});

// Create payment
app.post('/payments', async (req, res) => {
    const { orderId, paymentMethod, paymentDate, amount } = req.body;
    const payment = new Payment({ orderId, paymentMethod, paymentDate, amount });
    await payment.save();
    res.json({ message: 'Payment created successfully' });
});

// Get all payments
app.get('/payments', async (req, res) => {
    const payments = await Payment.find();
    res.json(payments);
});

// Get payment by id
app.get('/payments/:id', async (req, res) => {
    const id = req.params.id;
    const payment = await Payment.findById(id);
    res.json(payment);
});

// Create delivery
app.post('/deliveries', async (req, res) => {
    const { orderId, deliveryDate, status } = req.body;
    const delivery = new Delivery({ orderId, deliveryDate, status });
    await delivery.save();
    res.json({ message: 'Delivery created successfully' });
});

// Get all deliveries
app.get('/deliveries', async (req, res) => {
    const deliveries = await Delivery.find();
    res.json(deliveries);
});

// Get delivery by id
app.get('/deliveries/:id', async (req, res) => {
    const id = req.params.id;
    const delivery = await Delivery.findById(id);
    res.json(delivery);
});

// Start server
const port = 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
```