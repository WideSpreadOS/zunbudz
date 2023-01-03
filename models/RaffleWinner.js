const mongoose = require('mongoose');

const raffleWinnertSchema = new mongoose.Schema({
    winning_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    winning_ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'RaffleTicket' },
    prize: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    date_won: {
        type: Date,
        default: Date.now()
    }
});


module.exports = new mongoose.model('RaffleWinner', raffleWinnertSchema);