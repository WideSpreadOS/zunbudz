const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Product = require('../models/Product');
const RaffleTicket = require('../models/RaffleTicket');
const Raffle = require('../models/Raffle');
const Company = require('../models/Company');
const MissionStatement = require('../models/MissionStatement');
const SiteData = require('../models/SiteData');

// Welcome Page
router.get('/', async (req, res) => {
    let currentUser = null
    const companies = await Company.find()
    const raffles = await Raffle.find();
    const currentRaffle = raffles[raffles.length - 1]
    if (currentRaffle) {
        if (currentRaffle.dummy_ticket == false) {
        const totalTicketsAtStart = currentRaffle.total_tickets;
        const currentRafflePrize = await Product.findById(currentRaffle.raffle_product).populate('manufacturer').exec()
        console.log(currentRafflePrize)
        const allTickets = await RaffleTicket.find()
        const ticketsLeft = (totalTicketsAtStart - allTickets.length)
        res.render('landing', { page: 'Home', companies, ticketsLeft, currentRaffle, currentRafflePrize });
        } else {

            res.render('landing-no-raffle', { page: 'Home', companies });
        }
    } else {
        res.render('landing-no-raffle', { page: 'Home', companies});
    }
});

router.get('/about', async (req, res) => {
    const missionStatement = await MissionStatement.findOne()
    const companies = await Company.find()
    res.render('about', {companies, missionStatement})
});

router.get('/contact', async (req, res) => {
    const siteData = await SiteData.find()
    const companies = await Company.find()

    res.render('contact', {companies, siteData})
});








module.exports = router;