const express = require('express');
const { Product } = require("../models/products.js");
const mongoose = require("mongoose");
const router = express.Router();


router.get(`/`, async (req, res) => {
    try {
        const query = req.query.q;

        if(!query) {
            res.status(500).json({ msg:  "fail"})
        }

        const items = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i'}},
                { brand: { $regex: query, $options: 'i'}},
                { catName: { $regex: query, $options: 'i'}}
            ]
        })
        
        res.json(items);
    } catch (error) {
        res.status(500).json( { msg: 'sever error'})
    }
})

module.exports = router;