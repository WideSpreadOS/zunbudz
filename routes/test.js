const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');


// Models
const Shoe = require('../models/Shoe');
const Company = require('../models/Company');
const Product = require('../models/Product');




// Welcome Page
router.get('/', async (req, res) => {
    const shoes = await Shoe.find();
    res.render('test/home', { page: 'Testing Home', shoes });
});


// Manufacturer Page
router.get('/manufacturers', async (req, res) => {
    const companies = await Company.find();
    res.render('test/manufacturer/home', { page: 'Testing Manufacturer', companies });
});

router.post('/manufacturers/add', (req, res) => {
    const newCompanyData = req.body
    const company = new Company(newCompanyData)
    company.save()
    res.redirect('/test/manufacturers');
})




// Product Page
router.get('/products', async (req, res) => {
    const companies = await Company.find();
    const products = await Product.find().populate('manufacturer').exec();
    res.render('test/product/home', { page: 'Testing Product', companies, products });
});

router.post('/products/add', (req, res) => {
    const newCompanyData = req.body
    const product = new Product(newCompanyData)
    product.save()
    res.redirect('/test/products');
})



router.post('/shoes/add', (req, res) => {

    const shoe = new Shoe({
        company: req.body.company,
        shoe_name: req.body.shoe_name,
        description: req.body.description,
        sku: req.body.sku,
        supplier_website: req.body.supplier_website,
        product_webpage: req.body.product_webpage,
        product_image_url: req.body.product_image_url,
        color1: req.body.color1,
        color2: req.body.color2,
        price: req.body.price
    })
    shoe.save()
    res.redirect('/products');
})



// All Nikes Page
router.get('/Nike', async (req, res) => {
    res.render('sneakers/nike', { page: 'Nike' });
});


// All Jordans Page
router.get('/:companyName', async (req, res) => {
    const companyName = req.params.companyName;
    const companyProducts = await Shoe.find({ company: { $eq: companyName } })
    res.render('sneakers/jordan', { page: 'Jordan', companyProducts });
});

// Jordan ID Page
router.get('/:companyId/:shoeId', async (req, res) => {
    const companyId = req.params.companyId;
    const shoeId = req.params.shoeId;
    const shoe = await Shoe.findById(shoeId)
    res.render('sneakers/single-product', { page: shoe.shoe_name, shoe });
});

// Other Sneaker Brands Page
router.get('/other', async (req, res) => {
    res.render('sneakers/other', { page: 'Other Sneaker Brands' });
});





module.exports = router;