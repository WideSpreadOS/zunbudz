const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Stripe = require('stripe')
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY_LIVE);



// Models
const User = require('../models/User');
const Address = require('../models/Address');
const Company = require('../models/Company');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Raffle = require('../models/Raffle');
const RaffleTicket = require('../models/RaffleTicket');
const RaffleWinner = require('../models/RaffleWinner');
const UnregisteredCart = require('../models/UnregisteredCart');
const { ensureAuthenticated } = require('../config/auth');


// User Raffle Tickets Page
router.get('/', ensureAuthenticated, async (req, res) => {
    const user = req.user;
    const companies = await Company.find()
    
    const raffles = await Raffle.find();
    const winner = await Raffle.find({winning_user: user.id});
    console.log(winner)
    const currentRaffle = raffles[raffles.length - 1]
    
    const winningTickets = await Raffle.find({ winning_user: user.id }).populate({
        path: 'raffle_product',
        model: 'Product',
        populate: {
            path: 'manufacturer',
            model: 'Company'
        }
    }
    ).exec();;
    console.log(winningTickets)
    if(currentRaffle) {
        if (currentRaffle.dummy_ticket == false) {
            const allTickets = await RaffleTicket.find()
            const ticketsLeft = (100 - allTickets.length )
            console.log(`Tickets Left: ${ticketsLeft}`)
            const currentRafflePrize = await Product.findById(currentRaffle.raffle_product).populate('manufacturer').exec()
            const tickets = await RaffleTicket.find({'ticket_holder': user.id})
            res.render('user/raffle', { page: 'Your Raffle Tickets', user, winner, raffles, tickets, ticketsLeft, winningTickets, currentRaffle, currentRafflePrize, companies });
        } else {
            res.render('user/raffle-none', { page: 'Your Raffle Tickets', user, winner, winningTickets, companies });
        }

    } else {

        res.render('user/raffle-none' , { page: 'No Current Raffle', user, winner, winningTickets, companies });
    }
});

router.post('/tickets/test/purchase', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const ticket = new RaffleTicket({
        ticket_holder: userId
    });
    ticket.save()

    res.redirect(`/raffle`)
})

router.post('/tickets/purchase', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const ticket = new RaffleTicket({
        ticket_holder: userId
    });
    ticket.save()

    res.redirect(`/raffle/tickets/${ticket.id}/checkout`)
})

router.get(`/tickets/:ticketId/checkout`, ensureAuthenticated, async (req, res) => {
    const ticketId = req.params.ticketId;
    const amount = 100
    const amountInCents = amount * 100
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                name: 'Ticket',
                currency: 'usd',
                quantity: 1,
                amount: amountInCents
            }
        ],
        mode: 'payment',
        success_url: 'https://www.kicks101.store/raffle/payment/success',
        cancel_url: `https://www.kicks101.store/raffle/payment/cancel/${ticketId}`
    })
    console.log(session)
    res.redirect(303, session.url)
})

router.get('/payment/success', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id
    const user = await User.findById(userId)
    const companies = await Company.find()
    const raffles = await Raffle.find();
    const currentRaffle = raffles[raffles.length - 1]
    const currentRafflePrize = await Product.findById(currentRaffle.raffle_product).populate('manufacturer').exec()
    console.log(currentRafflePrize)
    const allTickets = await RaffleTicket.find()
    const ticketsLeft = (100 - allTickets.length)
    console.log(`Tickets Left: ${ticketsLeft}`)
    const tickets = await RaffleTicket.find({ 'ticket_holder': userId })
    res.render('user/raffle-success', { user, ticketsLeft, tickets, currentRaffle, currentRafflePrize, companies})
})

router.get('/payment/cancel/:ticketId', ensureAuthenticated, async (req, res) => {
    const ticketId = req.params.ticketId;
    const userId = req.user.id
    RaffleTicket.findByIdAndDelete(ticketId);
    res.redirect(`/raffle`)
})
module.exports = router;