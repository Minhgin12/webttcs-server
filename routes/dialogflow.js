const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// API để xử lý yêu cầu từ Dialogflow và trả dữ liệu từ MongoDB
router.post('/dialogflow/query', async (req, res) => {
  const { queryText } = req.body.queryResult; // Lấy câu hỏi từ phía client (Dialogflow)

  try {
    // Truy cập vào cơ sở dữ liệu MongoDB thông qua mongoose
    const db = mongoose.connection.db;

    // Tìm kiếm trong bộ sưu tập "products" của MongoDB
    const collection = db.collection('products');
    const product = await collection.findOne({ name: { $regex: queryText, $options: 'i' } });

    if (product) {
      // Nếu có sản phẩm tìm thấy, trả về thông tin sản phẩm
      res.json({
        fulfillmentText: `Sản phẩm bạn hỏi là: ${product.name}, giá: ${product.price}`,
      });
    } else {
      // Nếu không có sản phẩm, trả lời không tìm thấy
      res.json({
        fulfillmentText: 'Xin lỗi, tôi không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn.',
      });
    }
  } catch (error) {
    console.error('Error handling Dialogflow query:', error);
    res.status(500).json({
      fulfillmentText: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn.',
    });
  }
});

module.exports = router;
