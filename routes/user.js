const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const csrf = require('csurf');
const { ensureAuthenticated } = require('../config/auth');
require('../config/passport')(passport);

// Models
const User = require('../models/User');
const Address = require('../models/Address');
const PaymentMethod = require('../models/PaymentMethod');
const RaffleWinner = require('../models/RaffleWinner');
const Raffle = require('../models/Raffle');
const Product = require('../models/Product');
const Company = require('../models/Company');
const Cart = require('../models/Cart');



router.get('/login', async (req, res) => {
    const currentUser = null
    const companies = await Company.find();
    res.render('user/login', { page: 'Login', companies, currentUser });
})

router.get('/register', async (req, res) => {
    const currentUser = null
    const companies = await Company.find();
    res.render('user/register', { page: 'Register', companies, currentUser });
})

router.post('/register', async (req, res) => {
    const companies = await Company.find();
    const { fname, lname, email, password, password2 } = req.body;
    let errors = [];
    if (!fname || !lname || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' })
    }
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' })
    }
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' })
    }

    if (errors.length > 0) {
        res.render('user/register', {
            errors,
            fname,
            lname,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    errors.push({ msg: 'Email is already registered' })
                    res.render('user/register', {
                        errors,
                        fname,
                        lname,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        fname,
                        lname,
                        email,
                        password
                    });
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        // Set password to hashed
                        newUser.password = hash;
                        // Save user
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in');
                                res.render('user/login', { page: 'Login', companies });
                            })
                            .catch(err => console.log(err));

                    }))
                }
            })
            .catch();
    }
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/user/dashboard',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/user/login')
});

router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    const user = req.user;
    const userId = req.user.id;
    const companies = await Company.find();
    const orders = await Cart.find({"for_user": userId})
    res.render('user/dashboard', { page: 'Dashboard', companies, user, orders });
});

router.get('/update-profile', ensureAuthenticated, async (req, res) => {
    const user = req.user;
    const companies = await Company.find();
    res.render('user/update-profile', { page: 'Update Your Profile', companies, user })
});

router.patch('/update-profile', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const data = req.body;
    await User.findByIdAndUpdate(userId, data);
    res.redirect(req.get('referer'));
});

router.get('/mailing', ensureAuthenticated, async (req, res) => {
    const user = req.user;
    const companies = await Company.find();
    const addresses = await Address.find({address_owner: user.id})
    res.render('user/mailing', { page: 'Update Your Mailing Addresses', companies, user, addresses })
});

router.post('/mailing', ensureAuthenticated, (req, res) => {
    const newMailingAddress = req.body
    const address = new Address(newMailingAddress)
    address.save()
    res.redirect('/user/mailing')
});

router.get('/mailing/address/:addressId/edit', ensureAuthenticated, async (req, res) => {
    const user = req.user;
    const addressId = req.params.addressId;
    const address = await Address.findById(addressId)
    const companies = await Company.find();
    res.render('user/mailing-edit', {companies, address, user})
});

router.patch('/mailing/address/:addressId/edit', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const addressId = req.params.addressId;
        const updates = req.body;
        const options = { new: true }
        await Address.findByIdAndUpdate(addressId, updates, options);
        res.redirect(`/user/mailing`)
} catch (error) {
    console.log(error);
}
});

router.get('/mailing/address/:addressId/delete', ensureAuthenticated, async (req, res) => {
    const user = req.user;
    const addressId = req.params.addressId;
    await Address.findByIdAndDelete(addressId)
    res.redirect('/user/mailing')
});

router.get('/payment', ensureAuthenticated, async (req, res) => {
    const user = req.user;
    const companies = await Company.find();
    res.render('user/payment', { page: 'Update Your Payment Methods', companies, user })
});

router.get('/order-history/:orderId', ensureAuthenticated, async (req, res) => {
    const companies = await Company.find()
    const orderId = req.params.orderId
    const order = await Cart.findById(orderId).populate({
        path: 'items.product',
        model: 'Product',
        populate: {
            path: 'manufacturer',
            model: 'Company'
        }
    }).exec()
    res.render('user/order-id', {page: `Order ID:`, order, companies})
})




router.delete('/delete', ensureAuthenticated, async (req, res) => {
    const user = req.user.id;
    await User.findByIdAndDelete(user);
    res.redirect('/user/login')
});



router.get('/raffle/claim/:winningId', ensureAuthenticated, async (req, res) => {
    const winnerId = req.user.id;
    const winner = await User.findById(winnerId)
    const winningId = req.params.winningId;
    const companies = await Company.find();
    console.log(winner)
    const raffleWinner = await Raffle.findById(winningId).populate({
        path: 'raffle_product',
        model: 'Product',
        populate: {
            path: 'manufacturer',
            model: 'Company'
        }
    }
    ).exec();
    console.log(raffleWinner)
    res.render('user/raffle-claim', { companies, winner, raffleWinner})
})


router.get('/raffle/claim/:winningId/:userId/:productId/mailing', ensureAuthenticated, async (req, res) => {
    const winningId = req.params.winningId;
    const productId = req.params.productId;
    const userId = req.params.userId;
    const user = await User.findById(userId)
    const product = await Product.findById(productId).populate('manufacturer').exec()
    const companies = await Company.find();
    res.render('user/raffle-mail', {companies, winningId, user, product})
})

router.get('/test', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const companies = await Company.find();
    res.render('user/test-page', { page: 'Test Page', companies, user})
});




module.exports = router;