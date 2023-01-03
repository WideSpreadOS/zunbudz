const mongoose = require('mongoose');

const raffleSchema = new mongoose.Schema({
    raffle_product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    winning_ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'RaffleTicket' },
    winning_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ticket_price: Number,
    total_tickets: Number,
    raffle_draw: {
        type: Boolean,
        default: false
    },
    date_started: {
        type: Date,
        default: Date.now()
    },
    claimed: {
        type: Boolean,
        default: false
    },
    claimed_on: Date,
    dummy_ticket: {
        type: Boolean,
        default: false
    }

});


module.exports = new mongoose.model('Raffle', raffleSchema);