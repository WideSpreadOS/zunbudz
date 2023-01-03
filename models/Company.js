const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    main_url: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    }
});


module.exports = new mongoose.model('Company', companySchema);