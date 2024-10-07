const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// MongoDB connection
mongoose.connect('mongodb+srv://saran:1234@cluster0.nsdhf.mongodb.net/')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String }
});

const User = mongoose.model('User', userSchema);

// Product schema and model
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    stock: { type: Number, required: true },
    priceInOtherWebsites: [{ website: String, price: Number, link: String }],
    imageUrl: { type: String }
});

const Product = mongoose.model('Product', productSchema);

// Order schema and model
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    products: [{ productName: String, price: Number, quantity: Number }],
    totalAmount: Number,
    paymentMethod: String,
    createdAt: { type: Date, default: Date.now }
});

// Cart schema and model
const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [{ productName: String, price: Number, quantity: Number }]
});

const Cart = mongoose.model('Cart', cartSchema);


const Order = mongoose.model('Order', orderSchema);

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

// API endpoint to fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// API endpoint to fetch a specific product by name
app.get('/api/products/:name', async (req, res) => {
    const productName = req.params.name;
    try {
        const product = await Product.findOne({ name: productName });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add product to cart
// Add product to cart
app.post('/api/cart/add', isAuthenticated, async (req, res) => {
    const { productName, price, quantity } = req.body;

    let cart = await Cart.findOne({ userId: req.session.userId });

    if (!cart) {
        cart = new Cart({ userId: req.session.userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.productName === productName);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({ productName, price, quantity });
    }

    await cart.save();
    res.json({ message: 'Product added to cart', cart: cart.items });
});

// Remove product from cart
// Remove product from cart
app.post('/api/cart/remove', isAuthenticated, async (req, res) => {
    const { productName } = req.body;

    let cart = await Cart.findOne({ userId: req.session.userId });
    if (cart) {
        cart.items = cart.items.filter(item => item.productName !== productName);
        await cart.save();
    }

    res.json({ message: 'Product removed from cart', cart: cart ? cart.items : [] });
});

// Fetch cart contents
app.get('/api/cart', isAuthenticated, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.session.userId });
        res.json(cart ? cart.items : []);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Checkout route
// Checkout route
app.post('/api/cart/checkout', isAuthenticated, async (req, res) => {
    const cart = await Cart.findOne({ userId: req.session.userId });
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }

    const { method } = req.body;

    try {
        // Check stock availability
        for (const item of cart.items) {
            const product = await Product.findOne({ name: item.productName });
            if (!product) {
                return res.status(404).json({ message: `Product ${item.productName} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.productName}` });
            }
        }

        // Deduct stock and create order
        const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const newOrder = new Order({
            userId: req.session.userId,
            products: cart.items,
            totalAmount,
            paymentMethod: method,
        });

        await newOrder.save();

        // Deduct stock from products
        for (const item of cart.items) {
            const product = await Product.findOne({ name: item.productName });
            product.stock -= item.quantity;
            await product.save();
        }

        // Clear cart after checkout
        await Cart.deleteOne({ userId: req.session.userId });
        return res.json({ message: 'Order placed successfully', orderId: newOrder._id });
    } catch (error) {
        console.error('Error during checkout:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});



// Register new user
app.post('/register', async (req, res) => {
    const { username, email, password, phone, address } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }
        const newUser = new User({ username, email, password, phone, address });
        await newUser.save();
        return res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// User login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        req.session.userId = user._id;
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Fetch logged-in user details
app.get('/api/user', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch order history for the logged-in user
app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.session.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});


// Checkout route
app.post('/api/cart/checkout', async (req, res) => {
    const { method } = req.body;
    const userId = req.session.userId; // Assume userId is stored in session

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const cart = await Cart.findOne({ userId: userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const products = await Product.find({ name: { $in: cart.items.map(item => item.productName) } });
        let totalAmount = 0;

        for (const item of cart.items) {
            const product = products.find(p => p.name === item.productName);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.productName}` });
            }
            totalAmount += product.price * item.quantity;
            product.stock -= item.quantity;
            await product.save(); // Update stock in the database
        }

        const order = new Order({
            userId: userId,
            products: cart.items,
            totalAmount,
            paymentMethod: method
        });

        await order.save();
        await Cart.deleteOne({ userId: userId }); // Clear the cart after checkout

        res.status(200).json({ message: 'Order placed successfully', orderId: order._id });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});


