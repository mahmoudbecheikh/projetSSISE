const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    subCategories:[
        {
            type: Schema.Types.ObjectId,
            ref:"SubCategory"
        }
    ]
})


const Category = mongoose.model('Category', CategorySchema);

module.exports = Category