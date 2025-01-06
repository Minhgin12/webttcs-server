const express = require('express');
const router = express.Router();
const { Order } = require("../models/orders.js");

router.get('/', async (req, res) => {
    try {
      const { userid } = req.query; // Lấy userId từ query string
  
      if (!userid) {
        return res.status(400).json({
          success: false,
          message: "UserId không hợp lệ ~~~",
        });
      }
  
      // Tìm đơn hàng của người dùng theo userId
      const orders = await Order.find({ userid: userid });
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không có đơn hàng nào.",
        });
      }
  
      // Trả về danh sách đơn hàng
      return res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (err) {
      console.error("Lỗi server:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy đơn hàng.",
        error: err.message || err,
      });
    }
  });
router.post('/', async (req, res) => {
    try {
      // Lấy dữ liệu từ body của request
      const { name, phoneNumber, address, email, amount, order_receipt, userid, products } = req.body;
  
      // Kiểm tra dữ liệu đầu vào
      if (!name || !phoneNumber || !address || !email || !amount || !order_receipt || !userid || !products) {
        return res.status(400).json({
          message: 'Thiếu thông tin cần thiết để tạo đơn hàng.',
        });
      }
  
      // Tạo đối tượng Order mới
      const newOrder = new Order({
        name,
        phoneNumber,
        address,
        // pincode,
        email,
        amount,
        order_receipt,
        userid,
        products,
      });
  
      // Lưu vào database
      const savedOrder = await newOrder.save();
  
      // Phản hồi thành công
      res.status(201).json({
        message: 'Đơn hàng đã được tạo thành công.',
        data: savedOrder,
      });
    } catch (err) {
      console.error('Lỗi trong quá trình tạo đơn hàng:', err);
  
      // Phản hồi lỗi
      res.status(500).json({
        message: 'Có lỗi xảy ra trong quá trình tạo đơn hàng.',
        error: err.message || err,
      });
    }
  });
  router.get('/get/count', async (req, res) => {
    try {
        // Sử dụng countDocuments() để đếm số lượng đơn hàng
        const orderCount = await Order.countDocuments();

        // Kiểm tra nếu không có đơn hàng nào
        if (orderCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không có đơn hàng nào trong hệ thống.',
            });
        }

        // Trả về kết quả đếm
        return res.status(200).json({
            success: true,
            count: orderCount,
        });
    } catch (error) {
        console.error('Lỗi khi đếm đơn hàng:', error.message);

        // Phản hồi lỗi
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi đếm đơn hàng.',
            error: error.message || error,
        });
    }
});
router.get('/all', async (req, res) => {
  try {
      // Lấy toàn bộ đơn hàng từ database
      const orders = await Order.find();

      if (!orders || orders.length === 0) {
          return res.status(404).json({
              success: false,
              message: "Không có đơn hàng nào.",
          });
      }

      // Trả về danh sách đơn hàng
      return res.status(200).json({
          success: true,
          data: orders,
      });
  } catch (err) {
      console.error("Lỗi server:", err);
      return res.status(500).json({
          success: false,
          message: "Lỗi server khi lấy đơn hàng.",
          error: err.message || err,
      });
  }
});
router.post('/update-status', async (req, res) => {
  const { orderReceipt, newStatus } = req.body;

  try {
      // Tìm đơn hàng theo order_receipt
      const order = await Order.findOne({ order_receipt: orderReceipt });

      if (!order) {
          return res.status(404).json({ success: false, message: "Order not found" });
      }

      // Cập nhật trạng thái
      order.orderStatus = newStatus;
      order.updatedAt = Date.now();
      await order.save();

      res.json({ success: true, message: "Order status updated successfully", order });
  } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});



module.exports = router;