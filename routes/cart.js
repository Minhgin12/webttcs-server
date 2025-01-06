const { Cart } = require('../models/cart');
const express = require('express');
const router = express.Router();
const { Product } = require('../models/products');
// Get /cart
// router.get(`/`, async (req, res) => {
//     try {
//         const cartList = await Cart.find(req.query);

//         if (!cartList) {
//             res.status(500).json({ success: false })
//         }
//         return res.status(200).json(cartList);
//     }
//     catch (error) {
//         res.status(500).json({ success: false })
//     }
// });

router.get(`/`, async (req, res) => {
    try {
        const { userId } = req.query; // Lấy userId từ query

        if (!userId) {
            return res.status(400).json({ success: false, message: "UserId không hợp lệ" });
        }

        // Lọc giỏ hàng theo userId
        const cartList = await Cart.find({ userId: userId });

        // Nếu giỏ hàng trống, trả về mảng trống mà không có thông báo lỗi
        return res.status(200).json(cartList || []);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ success: false, message: "Lỗi server" });
    }
});


// router.post('/add', async (req, res) => {

//     let cartList = new Cart({
//       productTitle: req.body.productTitle,
//       images: req.body.image,
//       rating: req.body.rating,
//       price: req.body.price,
//       quantity: req.body.quantity,
//       subTotal: req.body.subTotal,
//       productId: req.body.productId,
//       userId: req.body.userId,
//     });

//     if (!cartList) {
//         res.status(500).json({
//           error: err,
//           success: false
//         })
//     }

//     cartList = await cartList.save();
//     res.status(201).json(cartList);


// });

// router.post('/add', async (req, res) => {
//     try {
//         const { productTitle, images, rating, price, quantity, subTotal, productId, userId } = req.body;

//         if (!productTitle || !images || !rating || !price || !quantity || !subTotal || !productId || !userId) {
//             return res.status(400).json({ success: false, error: "Thiếu dữ liệu đầu vào" });
//         }

//         const existingCartItem = await Cart.findOne({ productId, userId });

//         if (existingCartItem) {
//             return res.status(400).json({ success: false, message: "Sản phẩm đã có trong giỏ hàng" });
//         }

//         const cartItem = new Cart({
//             productTitle,
//             images,
//             rating,
//             price,
//             quantity,
//             subTotal,
//             productId,
//             userId
//         });

//         await cartItem.save();
//         res.status(201).json({ success: true, message: "Thêm sản phẩm thành công", cart: cartItem });
//     } catch (err) {
//         console.error("Error saving cart:", err);
//         res.status(500).json({ success: false, error: "Lỗi khi thêm sản phẩm vào giỏ hàng" });
//     }
// });
router.post('/add', async (req, res) => {
    try {
        const { productTitle, images, rating, price, quantity, subTotal, productId, userId } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!productTitle || !images || !rating || !price || !quantity || !subTotal || !productId || !userId) {
            return res.status(400).json({ success: false, error: "Thiếu dữ liệu đầu vào" });
        }

        // Lấy thông tin sản phẩm từ cơ sở dữ liệu
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
        }

        // Kiểm tra số lượng tồn kho
        if (quantity > product.countInStock) {
            return res.status(400).json({ 
                success: false, 
                message: `Số lượng yêu cầu (${quantity}) vượt quá hàng tồn kho (${product.countInStock}).` 
            });
        }

        // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
        const existingCartItem = await Cart.findOne({ productId, userId });
        if (existingCartItem) {
            return res.status(400).json({ success: false, message: "Sản phẩm đã có trong giỏ hàng" });
        }

        // Tạo mới sản phẩm trong giỏ hàng
        const cartItem = new Cart({
            productTitle,
            images,
            rating,
            price,
            quantity,
            subTotal,
            productId,
            userId
        });

        // Lưu sản phẩm vào cơ sở dữ liệu
        await cartItem.save();
        res.status(201).json({ success: true, message: "Thêm sản phẩm thành công", cart: cartItem });
    } catch (err) {
        console.error("Error saving cart:", err);
        res.status(500).json({ success: false, error: "Lỗi khi thêm sản phẩm vào giỏ hàng" });
    }
});


// API kiểm tra sản phẩm đã có trong giỏ hàng chưa
router.post('/check', async (req, res) => {
    try {
        const { productId, userId } = req.body;

        if (!productId || !userId) {
            return res.status(400).json({ success: false, error: "Thiếu dữ liệu đầu vào" });
        }

        const existingCartItem = await Cart.findOne({ productId, userId });
        res.status(200).json({ exists: !!existingCartItem });
    } catch (err) {
        console.error("Error checking cart:", err);
        res.status(500).json({ success: false, error: "Lỗi khi kiểm tra giỏ hàng" });
    }
});

router.delete('/:id', async (req, res) => {
    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
        res.status(404).json({ msg: "Không tìm thấy mục giỏ hàng đã cung cấp id!" })
    }

    const deletedItem = await Cart.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
        res.status(404).json({
            message: 'Khong tim thay muc gio hang',
            success: false
        })
    }
    res.status(200).json({
        success: true,
        message: 'Xoa muc gio hang thanh cong'
    })
});

router.delete("/", async (req, res) => {
    const { userId } = req.query; // Lấy userId từ query string
    
    if (!userId) {
        return res.status(400).json({ message: "Missing userId in query string" });  // Kiểm tra nếu thiếu userId
    }
    try {
        await Cart.deleteMany({ userId }); // Xóa giỏhàng theo userId
        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error clearing cart' });
    }
});

router.put('/:id', async (req, res) => {

    const cartList = await Cart.findByIdAndUpdate(
        req.params.id,
        {
            productTitle: req.body.productTitle,
            images: req.body.images,
            rating: req.body.rating,
            price: req.body.price,
            quantity: req.body.quantity,
            subTotal: req.body.subTotal,
            productId: req.body.productId,
            userId: req.body.userId
        },
        { new: true }
    )

    if (!cartList) {
        return res.status(500).json({
            message: 'Muc gio hang khong cap nhat thanh cong',
            success: false
        })
    }
    res.send(cartList);
})


module.exports = router;