const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    address_owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    street: String,
    building_number: String,
    apartment_number: String,
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    special_instructions: [String]
});

const Address = mongoose.model('Address', AddressSchema);

module.exports = Address;