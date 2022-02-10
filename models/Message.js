const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({

    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    reply: {
        type: Boolean,
        required: true
    },
    replyMessage: {
        type: String,
    }
})


const Message = mongoose.model('Message', MessageSchema);

module.exports = Message