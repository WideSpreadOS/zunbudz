const mongoose = require('mongoose');

const toDoSchema = new mongoose.Schema({
    name: String,
    for_route: String,
    type: String,
    description: String,
    importance: Number,
    done: {
        type: Boolean,
        default: false
    }
});


module.exports = new mongoose.model('ToDo', toDoSchema);