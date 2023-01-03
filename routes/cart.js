const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const env = require('dotenv').config()
const Stripe = require('stripe')
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY_LIVE);


// Models
const User = require('../models/User');
const Address = require('../models/Address');
const Company = require('../models/Company');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const UnregisteredCart = require('../models/UnregisteredCart');
const RaffleWinner = require('../models/RaffleWinner');
const Raffle = require('../models/Raffle');
const { ensureAuthenticated } = require('../config/auth');


// Current Cart Page
router.get('/shopping-cart', async (req, res) => {
    const user = req.user;
    const companies = await Company.find();

    if (!req.session.cart) {
        return res.render('cart/home', {products: null, companies})
    }
    const cart = new UnregisteredCart(req.session.cart)
    const itemArray = cart.generateArray()
    
    const getProducts = async () => {

    itemArray.forEach(async (item) => {
        console.log(item.item._id)
        const productId = item.item._id
        const product = await Product.findById(productId)
        const inStock = product.in_stock
        console.log('Now In Stock: ', inStock)
        return inStock
    })
    }
    getProducts()
        res.render('cart/home', { page: 'Current Cart', companies, products: cart.generateArray(), totalPrice: cart.totalPrice, totalQty: cart.totalQty, inStock: cart.in_stock });

});

router.get(`/add/:productId/:size`, async (req, res, next) => {
    const productId = req.params.productId;
    const cart = new UnregisteredCart(req.session.cart ? req.session.cart : {})
    Product.findById(productId, async function(err, product) {
        if (err) {
            return res.redirect('/products')
        }
        const availableSizes = product.available_sizes;

        const chosenSizeA = req.params.size;

        const size = availableSizes.find(element => {
            return element === chosenSizeA;
        });

        //let size = product.available_sizes == chosenSize;
        console.log(product.available_sizes)

        const productToReduce = await Product.findById(productId)
        let inStock = productToReduce.in_stock - 1
        console.log('\n\n\nIn Stock: ', inStock)
        await Product.findByIdAndUpdate(productId, {
            in_stock: inStock
        })
        cart.add(product, product.id, size, inStock);
        req.session.cart = cart;
        console.log(req.session.cart)
        res.redirect('/cart/shopping-cart')
    })
})
router.get(`/reduce/:productId`, async (req, res, next) => {
    const productId = req.params.productId;
    const cart = new UnregisteredCart(req.session.cart ? req.session.cart : {})

    const productToReduce = await Product.findById(productId)
    let inStock = productToReduce.in_stock + 1
    console.log('\n\n\nIn Stock: ', inStock)
    await Product.findByIdAndUpdate(productId, {
        in_stock: inStock
    })
    cart.reduceByOne(productId, inStock)
    req.session.cart = cart;
    res.redirect('/cart/shopping-cart')
})

router.get(`/remove/:productId`, async (req, res, next) => {
    const productId = req.params.productId;
    const cart = new UnregisteredCart(req.session.cart ? req.session.cart : {})

        const productToReduce = await Product.findById(productId)


        cart.addBackInventory(productId);
        req.session.cart = cart;
        console.log(req.session.cart)
        res.redirect(`/cart/remove-from-cart/${productId}`)
})

router.get('/remove-from-cart/:productId', async (req, res) => {
    const productId = req.params.productId;
    const cart = new UnregisteredCart(req.session.cart ? req.session.cart : {})
    cart.removeItem(productId)
    req.session.cart = cart;
    console.log(req.session.cart)
    res.redirect('/cart/shopping-cart')
})
router.get('/checkout', async (req, res, next) => {
    const companies = await Company.find();
    if (!req.session.cart) {
        return res.redirect('/cart/shopping-cart')
    }
    console.log(req.user)
    const cart = new UnregisteredCart(req.session.cart)
    const addresses = await Address.find({'address_owner': req.user.id})
    const items = cart.generateArray()
    for (i of items) {
        console.log(i.item._id)
    }
    res.render('cart/checkout', {page: 'Checkout', products: cart.generateArray(), total: cart.totalPrice, cart, companies, addresses})
});


router.post('/checkout-mailing', async (req, res) => {
    const mailingData = req.body
    const cart = req.session.cart
    console.log(mailingData)
    console.log(cart.totalQty)
    console.log(cart.totalPrice)

    const order = new Cart({
                    "unregistered_user.fname": req.body.fname,
                    "unregistered_user.lname": req.body.lname,
                    "unregistered_user.mailing_address.street": req.body.street,
                    "unregistered_user.mailing_address.building": req.body.building_number,
                    "unregistered_user.mailing_address.apartment": req.body.apartment_number,
                    "unregistered_user.mailing_address.city": req.body.city,
                    "unregistered_user.mailing_address.state": req.body.state,
                    "unregistered_user.mailing_address.zip": req.body.zip,
                    "unregistered_user.mailing_address.country": req.body.country,
                    "unregistered_user.mailing_address.special_instructions": req.body.special_instructions,
                    total_quantity: cart.totalQty,
                    total_price: cart.totalPrice
    })
    order.save()

    res.redirect(`/cart/checkout-add-items/${order.id}`)
})

router.get('/checkout-add-items/:cartId', async (req, res) => {
    const cartId = req.params.cartId;
    const cart = new UnregisteredCart(req.session.cart)
    const itemArray = cart.generateArray()
    console.log(itemArray)
    const addItems = async () => {

        for (i of itemArray) {
            console.log(i.item)
            let id = mongoose.Types.ObjectId(i.item._id);
            let qty = i.qty
            let size = i.size
            console.log('Item Quantity: ' + qty)
            console.log('Item Size: ' + size)
            await Cart.findByIdAndUpdate(cartId,
                { $push: { items: {
                    product: id,
                    quantity: qty,
                    chosen_size: size
                } } },
                { safe: true, upsert: true },
            )
        }
    }

    addItems()
    res.redirect(`/cart/checkout-billing/${cartId}`)
})
router.get('/checkout-mailing', async (req, res) => {
    const companies = await Company.find()
    res.render('cart/checkout-mailing', {page: 'Mailing Information', companies})
})

router.get('/checkout-billing/:cartId', async (req, res) => {
    const cartId = req.params.cartId;
    const cart = await Cart.findById(cartId)
    const amount = cart.total_price * 100
    const tax = amount * 0.06
    const saleTotal = amount + tax
    // console.log("AMOUNT: " + amount)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                name: 'Total Sale',
                price: cart.totalPrice,
                currency: 'usd',
                quantity: 1,
                amount: saleTotal
            }
        ],
        mode: 'payment',
        success_url: `https://www.kicks101.store/cart/payment/success/${cartId}`,
        cancel_url: 'https://www.kicks101.store/cart/shopping-cart',
    })
    // console.log(session)
    // console.log('Current User: ', req.user)
    const stripeOrderId = session.payment_intent
    // console.log(stripeOrderId)
    await Cart.findByIdAndUpdate(cartId, {
        for_user: req.user._id,
        stripe_order_id: stripeOrderId
    })

    req.session.cart = {}
    res.redirect(303, session.url)
})


router.get('/payment/success/:cartId', async (req, res) => {
    const cartId = req.params.cartId;
    const companies = await Company.find()
    const cart = await Cart.findById(cartId)
    console.log(`Cart: ${cart}`)
    res.render('cart/success', {cart, companies})
})


router.get('/receipt/:cartId', async (req, res) => {
    const cartId = req.params.cartId
    const companies = await Company.find()
    const cart = await Cart.findById(cartId).populate({
        path: 'items.product',
        model: 'Product',
        populate: {
            path: 'manufacturer',
            model: 'Company'
        }
    }).exec()
    res.render('cart/receipt', {cart, companies})
})
// Product Page
router.get('/products', async (req, res) => {
    const companies = await Company.find();
    const products = await Product.find().populate('manufacturer').exec();
    res.render('admin/product/home', { page: 'Admin Products', pageHeader: 'Home', companies, products });
});

router.post('/products/add', (req, res) => {
    const newCompanyData = req.body
    const product = new Product(newCompanyData)
    product.save()
    res.redirect('/admin/products');
});

router.get('/products/details/:productId', async (req, res) => {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('manufacturer').exec();
    res.render('admin/product/details', { product })
});

router.get('/products/type/:productType', async (req, res) => {
    const productType = req.params.productType;
    const companies = await Company.find();
    const products = await Product.find({ product_type: productType }).populate('manufacturer').exec();
    res.render('admin/product/type', { page: productType, products, companies })
});

router.get('/products/manufacturer/:manufacturerId', async (req, res) => {
    const manufacturerId = req.params.manufacturerId;
    const companies = await Company.find();
    const company = await Company.findById(manufacturerId)
    const products = await Product.find({ manufacturer: manufacturerId }).populate('manufacturer').exec();
    res.render('admin/product/manufacturer', { page: company.name, products, companies })
});

router.get('/products/edit/:productId', async (req, res) => {
    const companies = await Company.find();
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('manufacturer').exec();
    res.render('admin/product/edit', { product, companies })
});

router.patch('/products/edit/:productId', async (req, res) => {
    try {
        const productToEdit = req.params.productId;
        const updates = req.body;
        const options = { new: true }
        await Product.findByIdAndUpdate(productToEdit, updates, options);
        res.redirect(`/admin/products/edit/${productToEdit}`)
    } catch (error) {
        console.log(error);
    }
});


router.delete('/products/delete/:productId', async (req, res) => {
    const productToDelete = req.params.productId;
    await Product.findByIdAndDelete(productToDelete);
    res.redirect(`/admin/products`)
});




router.post('/raffle/claim/:raffleWinnerId/:productId', async (req, res) => {
    const raffleWinnerId = req.params.raffleWinnerId;
    const productId = req.params.productId;
    const chosenSize = req.body.chosen_size;
    const product = await Product.findById(productId)

    const order = new Cart({
        for_user: req.user.id,
        total_price: 0,
        total_quantity: 1
    })
    order.save()
    res.redirect(`/cart/raffle/claim/${raffleWinnerId}/${productId}/${chosenSize}/${order.id}/add-prize`)
});

router.get('/raffle/claim/:raffleWinnerId/:productId/:chosenSize/:orderId/add-prize', async (req, res) => {
    const raffleWinnerId = req.params.raffleWinnerId;
    const productId = req.params.productId;
    const chosenSize = req.params.chosenSize;
    const orderId = req.params.orderId;
    await Cart.findByIdAndUpdate(orderId,
        {
            $push: {
                items: {
                    product: productId,
                    quantity: 1,
                    chosen_size: chosenSize
                }
            }
        },
        { safe: true, upsert: true },
    )

    res.redirect(`/cart/raffle/claim/${raffleWinnerId}/${orderId}/mailing`)
})
router.get('/raffle/claim/:raffleWinnerId/:orderId/mailing', async (req, res) => {
    const companies = await Company.find()
    const raffleWinnerId = req.params.raffleWinnerId;
    const orderId = req.params.orderId;
    const order = await Cart.findById(orderId)
    const userId = req.user.id
    const user = await User.findById(userId)
    const userAddresses = await Address.find({address_owner: userId})
    res.render('user/raffle-mail', {raffleWinnerId, user, userAddresses, orderId, companies})
})


router.post('/raffle/claim/:raffleWinnerId/:orderId/add-address', async (req, res) => {
    const raffleWinnerId = req.params.raffleWinnerId;
    const orderId = req.params.orderId;
    const userId = req.user.id
    const user = await User.findById(userId)
    const order = await Cart.findByIdAndUpdate(orderId, {
        "unregistered_user.fname": user.fname,
        "unregistered_user.lname": user.lname,
        "unregistered_user.mailing_address.street": req.body.street,
        "unregistered_user.mailing_address.building": req.body.building_number,
        "unregistered_user.mailing_address.apartment": req.body.apartment_number,
        "unregistered_user.mailing_address.city": req.body.city,
        "unregistered_user.mailing_address.state": req.body.state,
        "unregistered_user.mailing_address.zip": req.body.zip,
        "unregistered_user.mailing_address.country": req.body.country,
        "unregistered_user.mailing_address.special_instructions": req.body.special_instructions,
    })
    res.redirect(`/cart/raffle/claim/${raffleWinnerId}/complete`)
})

router.get('/raffle/claim/:raffleWinnerId/complete', async (req, res) => {
    const raffleWinnerId = req.params.raffleWinnerId;

    await Raffle.findByIdAndDelete(raffleWinnerId)
    res.redirect(`/raffle`)
})

module.exports = router;