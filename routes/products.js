const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');


// Models
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Company = require('../models/Company');




// Welcome Page
router.get('/', async (req, res) => {
    const products = await Product.find().populate('manufacturer').exec();
    const companies = await Company.find()
    res.render('products/home', { page: 'Products', products, companies });
});

// Company Page
router.get('/manufacturer/:companyId', async (req, res) => {
    const companyId = req.params.companyId;
    const company = await Company.findById(companyId)
    const companies = await Company.find()
    const products = await Product.find({ 'manufacturer': { $eq: companyId } }).populate('manufacturer').exec();
    res.render('products/company', { page: company.name, company, companies, products });
});


router.get('/type/:type', async (req, res) => {
    const type = req.params.type;
    const companies = await Company.find();
    const products = await Product.find({ product_type: type}).populate('manufacturer').exec();
    res.render('products/type', { page: 'Products By Type', type: (type + "'s"), products, companies })
});


// Type of Product Page
router.get('/color/:color', async (req, res) => {
    const color = req.params.color;
    const companies = await Company.find()
    const products = await Product.find({main_color: ("#" + color)}).populate('manufacturer').exec();
    res.render('products/color', { page: 'Products By Color', color: ("#" + color), companies, products });
});

router.get('/color/:color', async (req, res) => {
    const color = req.params.color;
    const companies = await Company.find();
    const products = await Product.find({ main_color: ("#" + color) }).populate('manufacturer').exec();
    res.render('product/color', { page: 'Products By Color', color: ('#' + color), products, companies })
});


// Type of Product from Company Page
router.get('/manufacturer/:manufacturerId/type/:productType', async (req, res) => {
    const manufacturerId = req.params.manufacturerId;
    const productType = req.params.productType;
    const companies = await Company.find()
    const company = await Company.findById(manufacturerId)
    const products = await Product.find({'product_type': productType, 'manufacturer': manufacturerId}).populate('manufacturer').exec();
    res.render('products/company', { page: productType, company, companies, products });
});

// Single Product Page
router.get('/manufacturer/:companyId/product/:productId', async (req, res) => {
    const companyId = req.params.companyId;
    const productId = req.params.productId;
    const companies = await Company.find()
    const product = await Product.findById(productId).populate('manufacturer').exec();
    res.render('products/single-product', { page: product.name, product, companies });
});



// Outerwear Page
router.get('/outerwear', async (req, res) => {
    res.render('products/outerwear', { page: 'Outerwear' });
});

// T-Shirts Page
router.get('/t-shirts', async (req, res) => {
    res.render('products/t-shirts', { page: 'T-Shirts' });
});

// Accessories Page
router.get('/accessories', async (req, res) => {
    res.render('products/accessories', { page: 'Accessories' });
});





module.exports = router;