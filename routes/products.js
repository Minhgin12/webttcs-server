const express = require('express');
const { RecentlyViewed } = require("../models/recentlyViewed.js");
const { Product } = require("../models/products.js");
const { Category } = require("../models/category.js");
const router = express.Router();
const pLimit = require('p-limit');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs=require("fs");
var imagesArr = [];
cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
});
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);

    },
})
const upload = multer({ storage: storage })
// router.post(`/upload`, upload.array("images"), async (req, res) => {
//     imagesArr = [];
//     const files = req.files;
//     for (let i = 0; i < files.length; i++) {
//         imagesArr.push(files[i].filename);
//     }
//     // console.log(imagesArr);
//     res.json({images:imagesArr});
// });
router.post(`/upload`, upload.array("images"), async (req, res) => {
    let imageUrls = [];

    // Lặp qua các file đã tải lên và tải chúng lên Cloudinary
    for (let i = 0; i < req.files.length; i++) {
        const localImagePath = `uploads/${req.files[i].filename}`;

        try {
            // Tải lên Cloudinary
            const result = await cloudinary.uploader.upload(localImagePath);
            // Lưu URL của ảnh vào mảng imageUrls
            imageUrls.push(result.secure_url);

            // Tùy chọn: Xóa file local sau khi tải lên Cloudinary
            fs.unlinkSync(localImagePath);

        } catch (error) {
            return res.status(500).json({ error: "Lỗi khi tải ảnh lên Cloudinary", details: error });
        }
    }

    // Trả về các URL ảnh thay vì chỉ tên file
    res.json({ images: imageUrls });
});


// Lấy danh sách tất cả sản phẩm
router.get(`/`, async (req, res) => {

    const page=parseInt(req.query.page) || 1;
    const perPage=parseInt(req.query.perPage);
    const totalPosts = await Product.countDocuments();

    const totalPages= Math.ceil(totalPosts /perPage);

    if( page > totalPages){
        return res.status(404).json({message:"Không thấy trang"})
    }

    let productList=[];

    if( req.query.minPrice !== undefined && req.query.maxPrice !== undefined){
        productList = await Product.find({catId: req.query.catId}).populate("category");

        const filteredProducts = productList.filter( product => {
            if( req.query.minPrice && product.price < parseInt(+req.query.minPrice)){
                return false;
            }
            if( req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)){
                return false;
            }
            return true;
        });

        if (!productList) {
            res.status(500).json({ success: false })
        }
        return res.status(200).json({
            "products":filteredProducts,
            "totalPages":totalPages,
            "page":page
        });
    }else{
        productList = await Product.find(req.query).populate("category");

        if (!productList) {
            res.status(500).json({ success: false })
        }
        return res.status(200).json({
            "products":productList,
            "totalPages":totalPages,
            "page":page
        });
    }
    

    // if(req.query.catName !== undefined){
    //     productList = await Product.find({catName: req.query.catName}).populate("category");
    // }else{
    //     productList = await Product.find().populate("category")
    //         .skip((page-1)*perPage)
    //         .limit(perPage)
    //         .exec();
    // }

    
    

    

});
router.get(`/featured`, async (req, res) => {
    const productList = await Product.find( {isFeatured:true}); 
        if(!productList){
        res.status(500).json( { success :false})
    }
    return res.status(200).json(productList);
    })

router.post('/create', upload.array('images', 10), async (req, res) => {
    // Kiểm tra xem danh mục có tồn tại không
    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(404).send("Danh mục không tồn tại");
    }
    

    // Kiểm tra ảnh trong body
    const files = req.files;  // Các file ảnh được upload tạm thời bởi multer

    if (!files || files.length === 0) {
        return res.status(400).json({
            message: "Ảnh sản phẩm là bắt buộc"
        });
    }

    // Upload ảnh lên Cloudinary
    const imageUrls = [];
    for (let file of files) {
        try {
            const result = await cloudinary.uploader.upload(file.path);  // Upload lên Cloudinary
            imageUrls.push(result.secure_url);  // Lưu URL của ảnh sau khi upload
        } catch (err) {
            console.error('Cloudinary upload error:', err);
            return res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary', error: err });
        }
    }

    // Kiểm tra các trường dữ liệu khác
    if (!req.body.name || !req.body.description || !req.body.price) {
        return res.status(400).json({
            message: "Tên sản phẩm, mô tả và giá là bắt buộc"
        });
    }

    // Tạo một sản phẩm mới
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        images: imageUrls,  // Dùng URL ảnh từ Cloudinary
        brand: req.body.brand,
        price: req.body.price,
        catName: req.body.catName,
        catId: req.body.catId,
        category: req.body.category,
        oldPrice: req.body.oldPrice,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        isFeatured: req.body.isFeatured,
        discount: req.body.discount,
        productSIZE: req.body.productSIZE,
    });

    try {
        // Lưu sản phẩm vào MongoDB
        product = await product.save();
        res.status(201).json(product);  // Trả về sản phẩm đã tạo
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Lỗi khi tạo sản phẩm",
            error: err
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        // Tìm sản phẩm theo ID
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: 'Không tìm thấy sản phẩm',
                status: false
            });
        }

        // Lấy danh sách ảnh của sản phẩm
        const images = product.images;
        if (images.length !== 0) {
            // Xóa từng ảnh trên Cloudinary
            for (const image of images) {
                // Lấy public_id từ URL (phần cuối của URL không bao gồm định dạng file)
                const publicId = image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId); // Xóa ảnh trên Cloudinary
            }
        }

        // Xóa sản phẩm khỏi cơ sở dữ liệu
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({
                message: 'Không thể xóa sản phẩm',
                status: false
            });
        }

        res.status(200).json({
            message: 'Đã xóa sản phẩm thành công',
            status: true
        });
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        res.status(500).json({
            message: 'Có lỗi xảy ra khi xóa sản phẩm',
            status: false,
            error: error.message
        });
    }}
)

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(500).json({
            message: 'khong co san pham voi id nay'
        })
    }
    return res.status(200).send(product);


});


// router.get('/recentlyViewed', async (req, res) => {
    
//     console.log('Received query:', req.query);
//     let productList = [];
//     try {
//         productList = await RecentlyViewed.find(req.query).populate("category");
//         res.status(200).json({
//             products: productList,
//             totalPages,
//             page,
//         });
//     } catch (error) {
//         console.error('Query:', query);
//         console.error('Error:', error.message);
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

router.get('/recentlyViewed', async (req, res) => {
    console.log('Received query:', req.query);

    let productList = [];
    try {
        // Kiểm tra và chuyển đổi `_id` nếu tồn tại
        if (req.query._id && !mongoose.Types.ObjectId.isValid(req.query._id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        productList = await RecentlyViewed.find(req.query).populate('category');
        res.status(200).json({
            products: productList,
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put(`/:id/reduce-stock`, async (req, res) => {
    const { countInStock } = req.body;


    try {
        // Giảm số lượng tồn kho bằng `$inc`
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { countInStock: parseInt(countInStock, 10) } }, // Giảm số lượng tồn kho
            { new: true } // Trả về sản phẩm sau khi cập nhật
        );

        res.status(200).json({
            message: 'Giảm tồn kho thành công',
            product, // Trả về sản phẩm đã cập nhật
        });
    } catch (error) {
        console.error('Lỗi khi giảm tồn kho:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});



router.post('/recentlyViewed', async (req, res) => {
    try {
        let findProduct = await RecentlyViewed.find({proId: req.body.id});
        var product;
        const categoryId = req.body.category;  // Lấy ID danh mục từ body
        if (!categoryId) {
            return res.status(400).json({ message: "ID danh mục không được gửi" });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Danh mục không tồn tại" });
        }

        // Lấy tên danh mục từ đối tượng category
        const catName = category.name;

        const imageUrls = req.body.images;
        if (!imageUrls || imageUrls.length === 0) {
            return res.status(400).json({ message: "Ảnh sản phẩm là bắt buộc" });
        }

        if (!req.body.name || !req.body.description || !req.body.price) {
            return res.status(400).json({
                message: "Tên sản phẩm, mô tả và giá là bắt buộc"
            });
        }

        if(findProduct.length === 0){
            product = new RecentlyViewed({
                proId: req.body.id,
                name: req.body.name,
                description: req.body.description,
                images: imageUrls,  // Các ảnh gửi từ frontend
                brand: req.body.brand,
                price: req.body.price,
                catName: catName,  // Tên danh mục
                category: req.body.category,
                oldPrice: req.body.oldPrice,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                isFeatured: req.body.isFeatured,
                discount: req.body.discount,
                productSIZE: req.body.productSIZE,
            });
        }

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);

    } catch (err) {
        console.error("Lỗi trong quá trình tạo sản phẩm:", err);
        res.status(500).json({
            message: "Lỗi khi tạo sản phẩm",
            error: err.message || err
        });
    }
});


// API PUT để cập nhật sản phẩm
router.put('/:id', upload.array('images', 10), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: 'Sản phẩm không tồn tại',
                status: false
            });
        }

        const files = req.files;
        let imageUrls = [...product.images];  // Lấy ảnh hiện có của sản phẩm

        // Nếu có file ảnh mới, tải lên Cloudinary
        if (files && files.length > 0) {
            imageUrls = []; // Khởi tạo lại mảng ảnh

            for (let file of files) {
                try {
                    const result = await cloudinary.uploader.upload(file.path);
                    imageUrls.push(result.secure_url);  // Lưu URL ảnh vào mảng
                } catch (err) {
                    console.error('Cloudinary upload error:', err);
                    return res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary', error: err });
                }
            }
        }

        // Cập nhật sản phẩm với các thông tin mới, bao gồm ảnh
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name || product.name,
                description: req.body.description || product.description,
                images: imageUrls,  // Đảm bảo hình ảnh được lưu
                brand: req.body.brand || product.brand,
                price: req.body.price || product.price,
                oldPrice: req.body.oldPrice || product.oldPrice,
                category: req.body.category || product.category,
                catName: req.body.catName || product.catName,
                catId: req.body.catId|| product.catId,
                countInStock: req.body.countInStock || product.countInStock,
                rating: req.body.rating || product.rating,
                isFeatured: req.body.isFeatured !== undefined ? req.body.isFeatured : product.isFeatured,
                discount: req.body.discount || product.discount,
                productSIZE: req.body.productSIZE || product.productSIZE,
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(500).json({
                message: 'Không thể cập nhật sản phẩm',
                status: false
            });
        }

        res.status(200).json({
            message: 'Cập nhật sản phẩm thành công',
            status: true,
            product: updatedProduct
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Đã xảy ra lỗi trong khi cập nhật sản phẩm',
            status: false,
            error: error.message
        });
    }
});

router.get(`/get/count`, async (req, res) => {
    try {
        // Gọi countDocuments để đếm tổng số sản phẩm
        const productCount = await Product.countDocuments();

        // Kiểm tra nếu không có sản phẩm
        if (productCount === 0) {
            return res.status(404).json({  message: 'Không có sản phẩm nào!' });
        }

        // Trả về số lượng sản phẩm
        res.status(200).json({  productCount });
    } catch (error) {
        // Trả về lỗi nếu có vấn đề trong truy vấn
        res.status(500).json({  error: error.message });
    }
});

module.exports = router;
