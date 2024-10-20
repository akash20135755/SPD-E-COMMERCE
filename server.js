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
mongoose.connect('mongodb+srv://saran:1234@cluster0.nsdhf.mongodb.net/spd')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Notification = require('./models/Notification');
const Review = require('./models/review');

// Middleware for authentication
const isAuthenticated = require('./middlewares/auth');

// Fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch product by name
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

// Add review for a product
app.get('/api/products/:productId/reviews', async (req, res) => {
    const { productId } = req.params;

    try {
        const reviews = await Review.find({ productId })
            .populate('userId', 'username') // Populate username from userId
            .sort({ createdAt: -1 }); // Sort by the latest reviews

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this product' });
        }

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Fetch reviews for a specific product
app.get('/api/products/:productId/reviews', async (req, res) => {
    const { productId } = req.params;

    try {
        const reviews = await Review.find({ productId })
            .populate('userId', 'username') // Populate username from userId
            .sort({ createdAt: -1 });

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this product' });
        }

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

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

// Checkout route
app.post('/api/cart/checkout', isAuthenticated, async (req, res) => {
    const { method } = req.body;
    try {
        const cart = await Cart.findOne({ userId: req.session.userId });
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
            await product.save();
        }

        const order = new Order({
            userId: req.session.userId,
            products: cart.items,
            totalAmount,
            paymentMethod: method
        });

        await order.save();
        await Cart.deleteOne({ userId: req.session.userId });
        await Notification.create({
            userId: req.session.userId,
            message: 'Order placed successfully.',
            type: 'order',
        });

        res.status(200).json({ message: 'Order placed successfully', orderId: order._id });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: 'Internal server error' });
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

// Update personal information
app.put('/api/user/personal-info', isAuthenticated, async (req, res) => {
    const { username, email, phone, address } = req.body;

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username;
        user.email = email;
        user.phone = phone;
        user.address = address;

        await user.save();
        await Notification.create({
            userId: req.session.userId,
            message: 'Your personal information has been updated.',
            type: 'profile',
        });
        res.json({ message: 'Profile information updated successfully' });
    } catch (error) {
        console.error('Error updating personal info:', error);

        res.status(500).json({ message: 'Server error' });
    }
});

// Update password
app.put('/api/user/password', isAuthenticated, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Assuming you are using plain-text passwords for now.
        // Add password matching logic here.
        if (user.password !== currentPassword) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword; // In production, you should hash the password.
        await user.save();
        await Notification.create({
            userId: req.session.userId,
            message: 'Your personal information has been updated.',
            type: 'profile',
        });
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Server error' });
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
// Add review for a product
app.post('/api/products/:productId/review', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    try {
        const review = new Review({
            userId: req.session.userId,
            productId,
            rating,
            comment
        });

        await review.save();

        res.status(201).json({ message: 'Review added successfully', review });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Add review for a product
app.post('/api/products/:productId/review', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    try {
        const review = new Review({
            userId: req.session.userId,
            productId,
            rating,
            comment
        });

        await review.save();

        res.status(201).json({ message: 'Review added successfully', review });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/notifications', async (req, res) => {
    const notifications = await Notification.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.json(notifications);
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});