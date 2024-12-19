const {MyList} = require("../models/myList");
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    try {
        const myList = await MyList.find();

        if(!myList) {
            res.status(500).json({ success : false})
        }
        return res.status(200).json(myList);
    } catch (error) {
        res.status(500).json( {success : false})
    }
})

router.get('/:id', async (req, res) => {

    const item = await MyList.findById(req.params.id);

    if(!item){
        res.status(500).json({ message: 'khong tim thay id '})
    }
    return res.status(200).send(item);
})

router.post('/add', async (req, res) => {
    try {
        let item = await MyList.find({productId: req.body.productId, userId: req.body.userId});
     

        if(item.length === 0){
            let list = new MyList({
                productTitle: req.body.productTitle,
                image: req.body.image,
                rating: req.body.rating,
                price: req.body.price,
                productId: req.body.productId,
                userId: req.body.userId
            });

            if( !list){
                res.status(500).json({
                    error: err,
                    success: false
                })
            }
    
            list = await list.save();
            res.status(201).json(list);
        }

        

    } catch (err) {
        console.error("Lỗi trong quá trình tạo sản phẩm:", err);
        res.status(500).json({
            message: "Lỗi khi tạo sản phẩm",
            error: err.message || err
        });
    }
});

router.delete('/:id', async (req, res) => {
    const item = await MyList.findById(req.params.id);
    if(!item){
        res.status(404).json({msg :"the item given id is not found!!"})
    }

    const deletedItem = await MyList.findByIdAndDelete(req.params.id);

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

module.exports = router;
