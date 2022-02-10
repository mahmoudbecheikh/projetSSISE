const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: "SubCategory"
    },
})


const Product = mongoose.model('Product', ProductSchema);

module.exports = Product