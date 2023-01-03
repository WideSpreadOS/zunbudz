const mongoose = require('mongoose');


// THIS SCHEMA NEEDS TO BE MODIFIED -- THIS ALL PSEDO CODE FOR TESTING
// THIS SCHEMA NEEDS TO BE MODIFIED -- THIS ALL PSEDO CODE FOR TESTING
// THIS SCHEMA NEEDS TO BE MODIFIED -- THIS ALL PSEDO CODE FOR TESTING
// THIS SCHEMA NEEDS TO BE MODIFIED -- THIS ALL PSEDO CODE FOR TESTING

const PaymentMethodSchema = new mongoose.Schema({
    payment_type: {
        method: {
            type: String,
            required: true
        }, // Credit Card, Debit Card, Crypto, PayPal, etc.
        card_financier: String, // Visa, MasterCard, etc.
        card_number: String,
        card_expiration: String,
        card_cvv: String,
        account_number: String,
        routing_number: String,
        cardholder: {
            first_name: String,
            middle_name: String,
            last_name: String
        },
        pin_number: String,
        password: String
    },

});


const PaymentMethod = mongoose.model('PaymentMethod', PaymentMethodSchema);

module.exports = PaymentMethod;