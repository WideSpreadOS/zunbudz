const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');


// Models
const Company = require('../models/Company');
const Product = require('../models/Product');




router.post('/', (req, res) => {
    const query = req.body.query_term;
    res.redirect(`/search/${query}`)
});


router.get('/:query', async (req, res, next) => {
    const query = req.params.query
    const companies = await Company.find()
    Product.find({ "name": { "$regex": query, "$options": "i" } },
    
        async function (err, products) {
            for (let doc of products) {
                   await doc.populate('manufacturer');
                    console.log(doc)
                }
                res.render('search/results', { page: query, companies, products})
        });

})





module.exports = router;