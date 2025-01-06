const express = require('express');
const { Cart } = require('../models/cart');
const { Product } = require("../models/products.js");
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
var accessKey = 'F8BBA842ECF85';
var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';

router.post("/", async (req, res) => {
    const { amount, userid } = req.body; // Lấy số tiền từ body request

    // Kiểm tra xem amount có tồn tại không
    if (!amount || isNaN(amount)) {
        return res.status(400).json({ message: "Số tiền không hợp lệ" });
    }

    // Các thông tin thanh toán
    const orderInfo = 'Pay with MoMo';
    const partnerCode = 'MOMO';
    const redirectUrl = `${process.env.CLIENT_BASE_URL}/orders`;

    //const redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b'; // URL trả về sau khi thanh toán
    const ipnUrl = 'https://810b-42-113-220-239.ngrok-free.app/callback'; // URL nhận kết quả IPN
    const requestType = "payWithMethod";
    const orderId = partnerCode + new Date().getTime(); // Tạo ID đơn hàng
    const requestId = orderId; // Sử dụng orderId làm requestId
    const extraData = ''; // Dữ liệu thêm nếu cần
    const orderGroupId = ''; // Mã nhóm đơn hàng nếu cần
    const autoCapture = true;
    const lang = 'vi';

    // Trước khi ký HMAC SHA256 với định dạng
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    // Ký chuỗi với SHA256
    const signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    // Tạo đối tượng JSON gửi đến MoMo
    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature
    });

    const options = {
        url: "https://test-payment.momo.vn/v2/gateway/api/create",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        },
        data: requestBody
    };

    try {
        const result = await axios(options); // Gửi yêu cầu tới MoMo
        return res.status(200).json(result.data); // Trả về kết quả từ MoMo
        // if (result.data && result.data.orderId) {

        //    // Lấy giỏ hàng của người dùng
        //     const cartItems = await Cart.find({ userId: userid });

        //     // Cập nhật số lượng tồn kho
        //     for (const item of cartItems) {
        //         await Product.findByIdAndUpdate(
        //             item.productId,
        //             { $inc: { countInStock: -item.quantity } },
        //             { new: true }
        //         );
        //     }

        //     // Xóa giỏ hàng
        //     await Cart.deleteMany({ userId: userid });

        //     return res.status(200).json(result.data);
        // } else {
        //     return res.status(400).json({
        //         message: "Không thể tạo thanh toán."
        //     });
        // }
    } catch (error) {
        console.error("Error in MoMo API:", error); // Ghi log lỗi
        return res.status(500).json({
            statusCode: 500,
            message: "Lỗi server khi kết nối với MoMo"
        });
    }

});


router.post("/transaction-status", async (req, res) => {
    const { orderId } = req.body;
    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;
    const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = JSON.stringify({
        partnerCode: 'MOMO',
        requestId: orderId,
        orderId: orderId,
        signature,
        lang: 'vi'
    });

    const options = {
        url: "https://test-payment.momo.vn/v2/gateway/api/query",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: requestBody
    };

    try {
        const result = await axios(options);
        return res.status(200).json(result.data);
    } catch (error) {
        console.error("Error querying transaction status:", error.response?.data || error.message);
        return res.status(500).json({
            message: "Failed to query transaction status",
            error: error.response?.data || error.message
        });
    }
});
module.exports = router;
