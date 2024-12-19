const {ProductSize} = require("../models/productSize.js");
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    try {
        const productSizeList = await ProductSize.find();

        if(!productSizeList) {
            res.status(500).json({ success : false})
        }
        return res.status(200).json(productSizeList);
    } catch (error) {
        res.status(500).json( {success : false})
    }
})

router.get('/:id', async (req, res) => {

    const item = await ProductSize.findById(req.params.id);

    if(!item){
        res.status(500).json({ message: 'khong tim thay id '})
    }
    return res.status(200).send(item);
})

router.post('/create', async (req, res) => {
    let productSize = new ProductSize({
        productSIZE: req.body.productSIZE
    });

    if( !productSize ){
        res.status(500).json({
            error: err,
            success: false
        })
    }

    productSize = await productSize.save();

    res.status(201).json(productSize);
});

router.delete('/:id', async (req, res) => {
    const deletedItem = await ProductSize.findByIdAndDelete(req.params.id);

    if( !deletedItem)
    {
        res.status(404).json({
            message: 'item not found!',
            success: false
        })
    }

    res.status(200).json({
        success: true,
        message: 'item deleted'
    })
});

router.put('/:id', async (req, res) => {
    const item = await ProductSize.findByIdAndUpdate(
        req.params.id,
        {
            productSIZE: req.body.productSIZE,
        },
        { new : true}
    )

    if(!item){
        return res.status(500).json({
            message: 'item cannot be updated!',
            success: false
        })
    }

    res.send(item);
})

module.exports = router;
