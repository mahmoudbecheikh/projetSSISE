const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user : {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    numero : {
        type : Number , 
        required: true
    },

    date : {
        type: Date, 
        default: Date.now
    } ,

    montant : {
        type:Number,
        required: true
    },

    detail: [
        {
            type: Schema.Types.ObjectId,
            ref: "DetailOrder"
        }
    ],
    
    livraison : {
        type : String,
        required : true
    },

    payment: {
        type : Boolean ,
        required : true
    }

})


const Order = mongoose.model('Order', OrderSchema);

module.exports = Order