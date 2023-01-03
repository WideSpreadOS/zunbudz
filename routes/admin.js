const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


// Models
const User = require('../models/User');
const Address = require('../models/Address');
const CompanyAddress = require('../models/CompanyAddress');
const Company = require('../models/Company');
const Product = require('../models/Product');
const RaffleTicket = require('../models/RaffleTicket');
const RaffleWinner = require('../models/RaffleWinner');
const Cart = require('../models/Cart');
const Raffle = require('../models/Raffle');
const MissionStatement = require('../models/MissionStatement');
const SiteData = require('../models/SiteData');
const { populate } = require('../models/User');
const { ensureAuthenticated } = require('../config/auth');

// Admin Home Page
router.get('/', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const newOrders = await Cart.find({"shipped": false})
    const newOrdersLength = newOrders.length
    const allProducts = await Product.find()

    res.render('admin/home', { page: 'Admin Dashboard', companies, newOrdersLength, allProducts});
});


// Manufacturer Page
router.get('/manufacturers', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find();
    res.render('admin/manufacturer/home', { page: 'Admin Manufacturers', pageHeader: 'Home', companies });
});

router.post('/manufacturers/add', ensureAuthenticated, (req, res) => {
    const newCompanyData = req.body
    const company = new Company(newCompanyData)
    company.save()
    res.redirect('/admin/manufacturers');
})

router.get('/manufacturer/:companyId/edit', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const companyId = req.params.companyId;
    const company = await Company.findById(companyId)
    res.render('admin/manufacturer/edit', { page: 'Edit Company', companies, company})
})

router.patch('/manufacturer/:companyId/update', ensureAuthenticated, async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const updates = req.body;
        const options = { new: true }
        await Company.findByIdAndUpdate(companyId, updates, options);
        res.redirect(`/admin/manufacturer/${companyId}/edit`)
    } catch (error) {
        console.log(error);
    }

})

router.get('/manufacturer/:companyId/delete', ensureAuthenticated, async (req, res) => {
    const companyId = req.params.companyId;
    await Company.findByIdAndDelete(companyId)
    res.redirect('/admin/manufacturers')
})


// Product Page
router.get('/products', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find();
    const products = await Product.find().populate('manufacturer').exec();
    res.render('admin/product/home', { page: 'Admin Products', pageHeader: 'Home', companies, products });
});

router.post('/products/add', ensureAuthenticated, (req, res) => {
    const newCompanyData = req.body
    const product = new Product(newCompanyData)
    product.save()
    res.redirect('/admin/products');
});

router.get('/products/details/:productId', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('manufacturer').exec();
    console.log(product)
    res.render('admin/product/details', { companies, product})
});

router.get('/products/type/:productType', ensureAuthenticated, async (req, res) => {
    const productType = req.params.productType;
    const companies = await Company.find();
    const products = await Product.find({product_type: productType}).populate('manufacturer').exec();
    res.render('admin/product/type', { page: productType, products, companies })
});

router.get('/products/manufacturer/:manufacturerId', ensureAuthenticated, async (req, res) => {
    const manufacturerId = req.params.manufacturerId;
    const companies = await Company.find();
    const company = await Company.findById(manufacturerId)
    const products = await Product.find({manufacturer: manufacturerId}).populate('manufacturer').exec();
    res.render('admin/product/manufacturer', { page: company.name, products, companies })
});

router.get('/products/color/:color', ensureAuthenticated, async (req, res) => {
    const color = req.params.color;
    const companies = await Company.find();
    const products = await Product.find({ main_color: ("#" + color) }).populate('manufacturer').exec();
    res.render('admin/product/color', { page: 'Products By Color', color: ('#' + color),products, companies })
});

router.get('/products/edit/:productId', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find();
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('manufacturer').exec();
    res.render('admin/product/edit', {  product, companies})
});

router.get('/products/order/:productId', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find();
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('manufacturer').exec();
    res.render('admin/product/order', {  product, companies})
});

router.patch('/products/order/:productId', ensureAuthenticated, async (req, res) => {
    try {
        const productToEdit = req.params.productId;
        const orderedAmount = req.body.ordered_qty
        const product = await Product.findById(productToEdit)
        const currentStock = product.in_stock

        const updates = parseInt(orderedAmount) + parseInt(currentStock);
        console.log('Ordered Count: ', orderedAmount)
        console.log('Current Stock Count: ', currentStock)
        console.log('Updated Stock Count: ', updates)
        const options = { new: true }
        await Product.findByIdAndUpdate(productToEdit, {
            in_stock: updates
        });
        res.redirect(`/admin/products/details/${productToEdit}`)
    } catch (error) {
        console.log(error);
    }
});

router.patch('/products/edit/:productId', ensureAuthenticated, async (req, res) => {
    try {
        const productToEdit = req.params.productId;
        const updates = req.body;
        const options = { new: true }
        await Product.findByIdAndUpdate(productToEdit, updates, options);
        res.redirect(`/admin/products`)
    } catch (error) {
        console.log(error);
    }
});

router.delete('/products/delete/:productId', ensureAuthenticated, async (req, res) => {
        const productToDelete = req.params.productId;
        await Product.findByIdAndDelete(productToDelete);
        res.redirect(`/admin/products`)
});


/* User Info Routes */

router.get('/users', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const users = await User.find();
    res.render('admin/users/home', { page: "All Users", companies, users })
});

router.get('/users/details/this-is-for-security-abcdef-zyxwvu/:userId', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const userId = req.params.userId;
    const userAddresses = await Address.find({address_owner: userId})
    const user = await User.findById(userId);
    res.render('admin/users/single-user', { page: (user.fname + " " + user.lname), companies, user, userAddresses })
});

router.get('/users/security-level/admin/:userId', ensureAuthenticated, async (req, res) => {
    const userId = req.params.userId
    await User.findByIdAndUpdate(userId, {
        admin: true
    });
    res.redirect('/admin/users')
})

router.get('/users/security-level/none/:userId', ensureAuthenticated, async (req, res) => {
    const userId = req.params.userId
    await User.findByIdAndUpdate(userId, {
        admin: false
    });
    res.redirect('/admin/users')
})
/* Raffle Routes */

router.get('/raffle', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const users = await User.find();
    const tickets = await RaffleTicket.find().populate('ticket_holder').exec()
    const raffles = await Raffle.find().populate([
        {
            path: 'winning_user',
            model: 'User'
        },
        {
            path: 'raffle_product',
            model: 'Product',
            populate: {
                path: 'manufacturer',
                model: 'Company'
        }
    }
    ]).exec();

    const currentRaffle = raffles[raffles.length - 1]
    if (currentRaffle) {
        const currentRafflePrize = await Product.findById(currentRaffle.raffle_product).populate('manufacturer').exec()
        if (currentRaffle.dummy_ticket == false) {
            const currentPrizePrice = currentRafflePrize.price.base;
            console.log(currentPrizePrice)
            const currentTicketIncome = (tickets.length * currentRaffle.ticket_price)
            console.log(currentTicketIncome)
            const currentProfit = currentTicketIncome - currentPrizePrice;
            console.log(currentProfit)
            res.render('admin/raffle', { page: "Raffle", users, tickets, currentRaffle, currentRafflePrize, currentProfit, raffles, companies })
        } else {
            res.render('admin/raffle-no-product-selected', { page: "Raffle", users, tickets, currentRaffle, raffles, companies })
        }
    } else {
    res.render('admin/raffle-no-raffle', { page: "Raffle", companies })
    }
});

router.get('/raffle/new', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const products = await Product.find().populate('manufacturer').exec()
    res.render('admin/raffle-new', {products, companies})

});

router.post('/raffle/new', ensureAuthenticated, async (req, res) => {
    await Raffle.find({ dummy_ticket: true }).remove().exec(function (err, data) {
        console.log('Removed: ' + data)
    })
    const newRaffle = new Raffle({
        raffle_product: req.body.raffle_product,
        ticket_price: req.body.ticket_price,
        total_tickets: req.body.total_tickets
    })
    newRaffle.save()
    res.redirect('/admin/raffle')
});

router.get('/raffle/drawing', ensureAuthenticated, async (req, res) => {
    const raffleTickets = await RaffleTicket.find()
    let raffleArray = []
    for (i of raffleTickets) {
        raffleArray.push(i.id)
    }
    const raffles = await Raffle.find();
    const currentRaffle = raffles[raffles.length - 1]
    const currentRafflePrize = await Product.findById(currentRaffle.raffle_product).populate('manufacturer').exec()
    console.log(currentRafflePrize)
    const winnerId = raffleArray[Math.floor(Math.random() * raffleArray.length)];
    console.log('Winner: ' + winnerId)
    const findWinner = await RaffleTicket.findById(winnerId).populate('ticket_holder').exec()
    console.log('Ticket Holder: ' + findWinner.ticket_holder.id)
    const winningUserId = findWinner.ticket_holder.id
    // Random chosen ID is pushed to RaffleWinners Model with ticketId and userId
    await Raffle.findByIdAndUpdate(currentRaffle.id, {
        winning_user: winningUserId,
        winning_ticket: winnerId,
        raffle_draw: true
    })
    const newProductStock = currentRafflePrize.in_stock - 1
    const productId = newProductStock.id
    console.log(newProductStock)
    await Product.findByIdAndUpdate(productId, {
        in_stock: newProductStock
    })
    console.log(currentRafflePrize)
    //res.render(`admin/test`, {raffleTickets})
    res.redirect(`/admin/raffle/delete-tickets/${currentRaffle.id}`)
});

router.get('/raffle/delete-tickets/:winnerId', ensureAuthenticated, async (req, res) => {
    const winnerId = req.params.winnerId;
    await RaffleTicket.deleteMany()
    console.log('Deleted Tickets...')
    const blankRaffle = new Raffle({
        raffle_product: null,
        winning_ticket: null,
        ticket_price: null,
        total_tickets: null,
        dummy_ticket: true
    })
    blankRaffle.save()
    res.redirect(`/admin/raffle/winner/${winnerId}`)
});

router.get('/raffle/winner/:currentRaffleId', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const currentRaffleId = req.params.currentRaffleId;
    const currentRaffle = await Raffle.findById(currentRaffleId)
    console.log(currentRaffle)
    const winner = await User.findById(currentRaffle.winning_user)

    const raffleWinners = await Raffle.findById(currentRaffleId).populate({
        path: 'raffle_product',
        model: 'Product',
        populate: {
            path: 'manufacturer',
            model: 'Company'
        }
    }
    ).exec();
    
    console.log(currentRaffle)
    res.render('admin/raffle-winner', { winner, currentRaffle, raffleWinners, companies})
});


/* Orders Routes */

router.get('/invoices', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const allOrders = await Cart.find()
    res.render('admin/invoices/home', {allOrders, companies})
});
router.post('/invoices/search', ensureAuthenticated, async (req, res) => {
    const orderId = req.body.order_id
    await Cart.findById(orderId)
    res.redirect(`/admin/invoices/new/order/${orderId}`)
})
router.get('/invoices/new', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const allOrders = await Cart.find({"shipped": false})
    res.render('admin/invoices/all-orders', {allOrders, companies})
});

router.get('/invoices/new/order/:orderId', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const orderId = req.params.orderId;
    const order = await Cart.findById(orderId).populate({
        path: 'items.product',
        model: 'Product',
        populate: {
            path: 'manufacturer',
            model: 'Company'
        }
    }).exec()
    res.render('admin/invoices/order-id', {order, companies})
});

router.get('/invoices/new/order/:orderId/shipped', ensureAuthenticated, async (req, res) => {
    const orderId = req.params.orderId;
    await Cart.findByIdAndUpdate(orderId, {
        shipped: true,
        shipped_date: Date.now()
    })
    res.redirect(`/admin/invoices/new/order/${orderId}/reciept`)
});

router.post('/invoices/new/order/:orderId/ship-date', ensureAuthenticated, async (req, res) => {
    const orderId = req.params.orderId;
    await Cart.findByIdAndUpdate(orderId, {
        shipped: true,
        shipped_date: req.body.shipped_date
    })
    res.redirect(`/admin/invoices/new/order/${orderId}/reciept`)
});

router.get('/invoices/new/order/:orderId/reciept', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const orderId = req.params.orderId;
    const order = await Cart.findById(orderId).populate([
        {
            path: 'for_user',
            model: 'User'
        },
        {
            path: 'items.product',
            model: 'Product',
            populate: {
                path: 'manufacturer',
                model: 'Company'
            }
        }
    ]).exec()
    console.log(order)
    res.render('admin/invoices/reciept', {order, companies})
});

router.get('/invoices/new/order/:orderId/label', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const orderId = req.params.orderId;
    const order = await Cart.findById(orderId)
    res.render('admin/invoices/print-label-single', {order, companies})
});

router.get('/invoices/shipped/all', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const shippedOrders = await Cart.find({"shipped": true})
    res.render('admin/invoices/all-shipped', {shippedOrders, companies})
})
// Site Data

router.get('/site', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const siteData = await SiteData.find()
    const missionStatement = await MissionStatement.find()
    res.render('admin/site/home', { siteData, missionStatement, companies})
});

router.post('/site/mission-statement', ensureAuthenticated, async (req, res) => {
    const missionStatement = new MissionStatement({
        mission_statement: req.body.mission_statement
    })
    missionStatement.save()
    res.redirect('/admin/site')
});

router.post('/site/contact-site', ensureAuthenticated, (req, res) => {

    const contactData = new SiteData({
        contact_type: req.body.contact_type,
        contact_data: req.body.contact_data
    })
    contactData.save()
    res.redirect('/admin/site')
});

router.patch('/site/contact/:id/update', ensureAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        const options = { new: true }
        await SiteData.findByIdAndUpdate(id, updates, options);
        res.redirect(`/admin/site`)
    } catch (error) {
        console.log(error);
    }
});

router.get('/site/contact/:id/delete', ensureAuthenticated, async (req, res) => {
    const id = req.params.id;
    await SiteData.findByIdAndDelete(id)
    res.redirect('/admin/site')
});

router.get('/site/contact/:id/edit', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const id = req.params.id
    const connection = await SiteData.findById(id)
    res.render('admin/site/edit', {connection, companies})
});

router.post('/site/contact-site', ensureAuthenticated, (req, res) => {

    const contactData = new SiteData({
        contact_type: req.body.contact_type,
        contact_data: req.body.contact_data
    })
    contactData.save()
    res.redirect('/admin/site')
});

router.patch('/site/mission-statement/:id', ensureAuthenticated, async (req, res) => {
    try {
        const id = req.params.id
        const updates = req.body;
        const options = { new: true }
        await MissionStatement.findByIdAndUpdate(id, updates, options);
        res.redirect(`/admin/site`)
    } catch (error) {
        console.log(error);
    }
});

router.patch('/site/contact-site/:id', ensureAuthenticated, async (req, res) => {
    try {
        const id = req.params.id
        const updates = req.body;
        const options = { new: true }
        await SiteData.findByIdAndUpdate(id, updates, options);
        res.redirect(`/admin/site`)
    } catch (error) {
        console.log(error);
    }
});

// Company Return Address
router.post('/site/company-address', ensureAuthenticated, (req, res) => {

    const companyAddress = new CompanyAddress({
        street: req.body.street,
        building_number: req.body.building_number,
        apartment_number: req.body.apartment_number,
        po_box: req.body.po_box,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        zip: req.body.zip,
        special_instructions: req.body.special_instructions,
        notes: req.body.notes,
    })
    companyAddress.save()
    res.redirect('/admin/site')
});


// Admin Accounts
router.get('/admin-accounts', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    res.render('admin/accounts/home', {companies})
})


// Admin Help Pages
router.get('/help', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    res.render('admin/help/home', {companies})
})







// Export Routes
module.exports = router;