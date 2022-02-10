const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SubCategorySchema = new Schema({
    titleSub: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    }
    ,
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ]
})


const SubCategory = mongoose.model('SubCategory', SubCategorySchema);

module.exports = SubCategory