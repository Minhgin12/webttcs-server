// const { ProductReviews } = require('../models/productReview');
// const express = require("express");
// const router = express.Router();

// router.get('/', async (req, res) => {
//     let reviews = [];
//     try {
//         if (req.query.productId !== undefined && req.query.productId !== null && req.query.productId !== "") {
//             reviews = await ProductReviews.find({ productId: req.query.productId });
//         }
//         else {
//             reviews = await ProductReviews.find();
//         }
//         if (!reviews) {
//             res.status(500).json({ success: false })
//         }
//         return res.status(200).json(reviews);
//     } catch (error) {
//         res.status(500).json({ success: false })
//     }
// });
// router.get('/:id', async (req, res) => {
//     const review = await ProductReviews.findById(req.params.id);
//     if (!review) {
//         res.status(500).json({ message: " Không thấy đánh giá với id trên" })
//     }
//     return res.status(200).json(reviews);
// })
// router.post('/add',async(req,res)=>{
//     let review = new ProductReviews({
//         customerId: req.body.customerId,
//         customerName : req.body.customerName,
//         review:req.body.review,
//         customerRating:req.body.customerRating,
//         productId: req.body.productId
//     });
//     if(!review){
//         res.status(500).json({
//             error:err,
//             success:false
//         })
//     }
//     review = await review.save();
//     res.status(201).json(review);
// });
// module.exports = router;

const { ProductReviews } = require('../models/productReview');
const express = require("express");
const router = express.Router();

// router.get('/', async (req, res) => {
//     let reviews = [];
//     try {
//         if (req.query.productId !== undefined && req.query.productId !== null && req.query.productId !== "") {
//             reviews = await ProductReviews.find({ productId: req.query.productId });
//         }
//         else {
//             reviews = await ProductReviews.find();
//         }
//         if (!reviews) {
//             res.status(500).json({ success: false })
//         }
//         return res.status(200).json(reviews);
//     } catch (error) {
//         res.status(500).json({ success: false })
//     }
// });
router.get('/', async (req, res) => {
    try {
      const productId = req.query.productId;
      const reviews = productId
        ? await ProductReviews.find({ productId }).populate('replies')
        : await ProductReviews.find().populate('replies');
  
      res.status(200).json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Đã xảy ra lỗi khi lấy danh sách bình luận.' });
    }
  });
  

// router.get('/:id', async (req, res) => {
//     const review = await ProductReviews.findById(req.params.id);
//     if (!review) {
//         res.status(500).json({ message: " Không thấy đánh giá với id trên" })
//     }
//     return res.status(200).json(reviews);
// })

router.get('/:id', async (req, res) => {
    try {
        const review = await ProductReviews.findById(req.params.id).populate('replies');
        if (!review) {
            return res.status(404).json({ message: "Không thấy đánh giá với ID trên" });
        }
        return res.status(200).json(review);  // Trả về review đúng
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy bình luận.' });
    }
});

router.post('/add',async(req,res)=>{
    let review = new ProductReviews({
        customerId: req.body.customerId,
        customerName : req.body.customerName,
        review:req.body.review,
        customerRating:req.body.customerRating,
        productId: req.body.productId
    });
    if(!review){
        res.status(500).json({
            error:err,
            success:false
        })
    }
    review = await review.save();
    res.status(201).json(review);
});
router.post('/:id/reply', async (req, res) => {
    try {
      const reviewId = req.params.id;
  
      // Tìm bình luận theo ID
      const review = await ProductReviews.findById(reviewId);
  
      if (!review) {
        return res.status(404).json({ message: 'Không tìm thấy bình luận!' });
      }
  
      // Thêm phản hồi mới vào danh sách replies
      const newReply = {
        responderName: req.body.responderName || 'Admin', // Lấy tên người trả lời từ request
        reply: req.body.reply,
        timestamp: new Date(),
      };
      review.replies.push(newReply);
  
      // Lưu lại bình luận sau khi cập nhật
      await review.save();
  
      res.status(201).json({ success: true, review });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Đã xảy ra lỗi khi thêm phản hồi.' });
    }
  });

  router.delete('/:reviewId', async (req, res) => {
    const { reviewId } = req.params;

    try {
        // Tìm và xóa bình luận theo ID
        const deletedReview = await ProductReviews.findByIdAndDelete(reviewId);

        if (!deletedReview) {
            return res.status(404).json({ message: 'Không tìm thấy bình luận cần xóa.' });
        }

        // Nếu có liên kết phản hồi với bình luận, xóa phản hồi
        // (Tùy thuộc vào yêu cầu của bạn về việc xóa phản hồi)
        // await ProductReviews.updateMany(
        //   { 'replies._id': { $in: deletedReview.replies.map(reply => reply._id) } },
        //   { $pull: { replies: { _id: { $in: deletedReview.replies.map(reply => reply._id) } } } }
        // );

        res.status(200).json({ message: 'Bình luận đã được xóa thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa bình luận.' });
    }
});

module.exports = router;
