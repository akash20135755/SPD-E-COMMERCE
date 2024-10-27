const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category:{type: String,required: true},
    price: { type: Number, required: true },
    description: { type: String },
    stock: { type: Number, required: true },
    priceInOtherWebsites: [{ website: String, price: Number, link: String }],
    imageUrl: { type: String }
});
module.exports= mongoose.model('Product', productSchema);
