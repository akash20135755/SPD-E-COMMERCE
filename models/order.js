const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    products: [{ productName: String, price: Number, quantity: Number }],
    totalAmount: Number,
    paymentMethod: String,
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', orderSchema);
