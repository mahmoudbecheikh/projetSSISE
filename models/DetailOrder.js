const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DetailOrderSchema = new Schema({

    product:{
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type:Number,
        required: true
    },

    order: {
        type: Schema.Types.ObjectId,
        ref: "Order"
    },

})


const Order = mongoose.model('DetailOrder', DetailOrderSchema);

module.exports = Order