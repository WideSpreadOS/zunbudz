const mongoose = require('mongoose');

const raffleTicketSchema = new mongoose.Schema({
    ticket_holder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    purchased: {
        type: Date,
        default: Date.now()
    }
});


module.exports = new mongoose.model('RaffleTicket', raffleTicketSchema);