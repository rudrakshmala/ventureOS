const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    address: String
});

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    quantity: Number
});

const orderSchema = new mongoose.Schema({
    userId: String,
   /products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    total: Number,
    status: String
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({ name: req.body.name, email: req.body.email, password: hashedPassword, address: req.body.address });
        await user.save();
        res.status(201).send({ message: 'User created successfully' });
    } catch (err) {
        res.status(400).send({ message: 'Error creating user' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).send({ message: 'Invalid email or password' });
        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) return res.status(401).send({ message: 'Invalid email or password' });
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.send({ message: 'Logged in successfully' });
    } catch (err) {
        res.status(400).send({ message: 'Error logging in' });
    }
});

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.send(products);
    } catch (err) {
        res.status(400).send({ message: 'Error fetching products' });
    }
});

app.post('/products', async (req, res) => {
    try {
        const product = new Product({ name: req.body.name, description: req.body.description, price: req.body.price, quantity: req.body.quantity });
        await product.save();
        res.status(201).send({ message: 'Product created successfully' });
    } catch (err) {
        res.status(400).send({ message: 'Error creating product' });
    }
});

app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.send(orders);
    } catch (err) {
        res.status(400).send({ message: 'Error fetching orders' });
    }
});

app.post('/orders', async (req, res) => {
    try {
        const order = new Order({ userId: req.body.userId, products: req.body.products, total: req.body.total, status: 'pending' });
        await order.save();
        res.status(201).send({ message: 'Order created successfully' });
    } catch (err) {
        res.status(400).send({ message: 'Error creating order' });
    }
});

app.put('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: 'delivered' }, { new: true });
        res.send(order);
    } catch (err) {
        res.status(400).send({ message: 'Error updating order' });
    }
});

app.delete('/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.send({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(400).send({ message: 'Error deleting order' });
    }
});

app.get('/geolocation', async (req, res) => {
    try {
        const coordinates = await getCoordinates(req.query.address);
        res.send(coordinates);
    } catch (err) {
        res.status(400).send({ message: 'Error fetching geolocation' });
    }
});

function getCoordinates(address) {
    return new Promise((resolve, reject) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK') {
                resolve(results[0].geometry.location);
            } else {
                reject(status);
            }
        });
    });
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));