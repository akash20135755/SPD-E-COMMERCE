// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['cart', 'order', 'profile'], required: true }, // Types for notifications
    // Optional fields for 'order' type
    orderDetails: {
        productName: { type: String }, // Product name for order notification
        quantity: { type: Number },    // Quantity for order notification
    }
});

// Validator to ensure `orderDetails` fields are only present for `order` type notifications

module.exports = mongoose.model('Notification', notificationSchema);
