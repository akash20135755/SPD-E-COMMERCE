const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [{ productName: String, price: Number, quantity: Number }]
});

module.exports = mongoose.model('Cart', cartSchema);
