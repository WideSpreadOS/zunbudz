const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    feature_name: String,
    description: String,
    done: {
        type: Boolean,
        default: false
    }
});


module.exports = new mongoose.model('Feature', featureSchema);