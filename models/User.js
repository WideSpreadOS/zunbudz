const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    admin: {
        type: Boolean,
        default: false
    },
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    _csrf: String,
    saved_password: String,
    mailing_address: {
        primary: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
        secondary: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' }
    },
    billing: {
        payment_methods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' }],
        address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    },
    joined_date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;