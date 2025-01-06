// controllers/orders.js
const mongoose = require('mongoose');

// Định nghĩa schema cho đơn hàng
const orderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    // pincode: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    order_receipt: { type: String, required: true },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            productTitle: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            subTotal: { type: Number, required: true },
            images: { type: String, required: true },
            rating: { type: Number },
        },
    ],
    orderStatus: { type: String, default: "pending" }, // Thêm trạng thái
}, { timestamps: true });

// Tạo model
exports.Order = mongoose.model('Order', orderSchema);
exports.orderSchema = orderSchema;

