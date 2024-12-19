const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

const pLimit = require('p-limit');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
});


router.get(`/`, async (req, res) => {
    try {
        const page=parseInt(req.query.page) || 1;
        const perPage=8;
        const totalPosts = await Category.countDocuments();
        const totalPages= Math.ceil(totalPosts /perPage);
        
        if(page>totalPages){
            return res.status(404).json({message:"Không thấy trang"})
        }
        const categoryList = await Category.find()
            .skip((page-1)*perPage)
            .limit(perPage)
            .exec();
        if (!categoryList) {
            res.status(500).json({ success: false })
        }
        return res.status(200).json({
            "categoryList":categoryList,
            "totalPages":totalPages,
            "page":page
        });
    }

    catch (error) {
        res.status(500).json({ success: false })
    }
}
);
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(500).json({ message: 'khong thay san pham voi id do' })
    }
    return res.status(200).send(category);
}
)
router.delete('/:id', async (req, res) => {
    const deleteUser = await Category.findByIdAndDelete(req.params.id);
    if (!deleteUser) {
        res.status(404).json({
            message: 'Khong thay san pham',
            success: false
        })
    }
    res.status(200).json({
        success: true,
        message: 'xoa thanh cong'
    })
}
);
router.post('/create', async (req, res) => {
    const limit = pLimit(2);
    const imagesToUpload = req.body.images.map((image) => {
        return limit(async () => {
            const result = await cloudinary.uploader.upload(image);
            //console.log(`succesful`)
            //console.log(`result 1 24:14`)
            return result;
        }
        )
    }
    );
    const uploadStatus = await Promise.all(imagesToUpload);
    const imgurl = uploadStatus.map((item) => {
        return item.secure_url
    })
    if (!uploadStatus) {
        return res.status(500).json({
            error: "images cannot upload",
            status: false
        }

        )
    }
    let category = new Category(
        {
            name: req.body.name,
            images: imgurl,
            color: req.body.color

        }
    );
    if (!category) {
        res.status(500).json(
            {
                error: err,
                success: false

            }
        )
    }
    category = await category.save();
    res.status(201).json(category);
}
);
router.put('/:id', async (req, res) => {

    const limit = pLimit(2);
    const imagesToUpload = req.body.images.map((image) => {
        return limit(async () => {
            const result = await cloudinary.uploader.upload(image);
            //console.log(`succesful`)
            //console.log(`result 1 24:14`)
            return result;
        }
        )
    }
    );
    const uploadStatus = await Promise.all(imagesToUpload);
    const imgurl = uploadStatus.map((item) => {
        return item.secure_url
    })
    if (!uploadStatus) {
        return res.status(500).json({
            error: "images cannot upload",
            status: false
        }

        )
    }
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            images: imgurl,
            color: req.body.color
        },
        { new: true }
    )
    if (!category) {
        return res.status(500).json({
            message: 'khong update thanh cong',
            success: false
        })
    }
    res.send(category);
})

module.exports = router;
/*
const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    try {
        const categoryList = await Category.find();
        if (categoryList.length === 0) {  // Kiểm tra nếu mảng rỗng
            return res.status(404).json({ success: false, message: "No categories found" });
        }
        res.json(categoryList);  // Trả về dữ liệu
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
*/
