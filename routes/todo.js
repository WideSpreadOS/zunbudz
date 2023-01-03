const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Product = require('../models/Product');
const RaffleTicket = require('../models/RaffleTicket');
const Raffle = require('../models/Raffle');
const Company = require('../models/Company');
const Feature = require('../models/Feature');
const Bug = require('../models/Bug');
const ToDo = require('../models/ToDo');

// To Do Page


router.get('/', async (req, res) => {
    const features = await Feature.find()
    const bugs = await Bug.find()
    const companies = await Company.find()
    res.render('todo', {page: 'To Do Page', companies, features, bugs})
});

router.post('/feature/add', (req, res) => {
    const feature = new Feature({
        feature_name: req.body.feature_name,
        description: req.body.description
    })
    feature.save()

    res.redirect('/todo')
});

router.post('/bug/add', (req, res) => {
    const bug = new Bug({
        page_url: req.body.page_url,
        action_attempted: req.body.action_attempted,
        description: req.body.description
    })
    bug.save()

    res.redirect('/todo')
});

router.get('/todo-list', async (req, res) => {
    const todos = await ToDo.find()
    const companies = await Company.find()
    res.render('todo-list', { page: 'To Do List', companies, todos})
});

router.post('/todo-list/add', (req, res) => {
    const todoItem = new ToDo({
        name: req.body.name,
        for_route: req.body.for_route,
        type: req.body.type,
        description: req.body.description,
        importance: req.body.importance
    })
    todoItem.save()
    res.redirect('/todo/todo-list')
});






module.exports = router;