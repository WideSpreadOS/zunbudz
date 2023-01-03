const mongoose = require('mongoose');

const missionStatementSchema = new mongoose.Schema({
    mission_statement: {
        type: String,
        required: true
    }
});


module.exports = new mongoose.model('MissionStatement', missionStatementSchema);