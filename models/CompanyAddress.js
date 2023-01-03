const mongoose = require('mongoose');

const CompanyAddressSchema = new mongoose.Schema({
    street: String,
    building_number: String,
    apartment_number: String,
    po_box: String,
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
    zip: String,
    special_instructions: [String],
    notes: [String]
});

const CompanyAddress = mongoose.model('CompanyAddress', CompanyAddressSchema);

module.exports = CompanyAddress;