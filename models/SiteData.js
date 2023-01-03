const mongoose = require('mongoose');

const siteDataSchema = new mongoose.Schema({
    contact_type: String,
    contact_data: String
});


module.exports = new mongoose.model('SiteData', siteDataSchema);