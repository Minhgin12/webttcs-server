// const mongoose = require('mongoose')

// const productReviewsSchema = mongoose.Schema({
//     productId:{
//         type: String,
//         require: true
//     },
//     customerName:{
//         type: String,
//         require: true
//     },
//     customerId:{
//         type: String,
//         require: true
//     },
//     review:{
//         type: String,
//         require: true,
//         default:""
//     },
//     customerRating:{
//         type:Number,
//         required:true,
//         default:1
//     },
//     dateCreated:{
//         type:Date,
//         default:Date.now,
//     }
// })
// productReviewsSchema.virtual('id').get(function(){
//     return this._id.toHexString();
// })
// const ProductReviews = mongoose.model('ProductReviews', productReviewsSchema);
// module.exports = { ProductReviews };
const mongoose = require('mongoose');

// Định nghĩa schema cho các phản hồi
const replySchema = mongoose.Schema({
    responderName: {
        type: String,
        required: true, // Người trả lời
    },
    reply: {
        type: String,
        required: true, // Nội dung phản hồi
    },
    timestamp: {
        type: Date,
        default: Date.now, // Thời gian tạo phản hồi
    },
});

// Định nghĩa schema cho đánh giá sản phẩm
const productReviewsSchema = mongoose.Schema({
    productId: {
        type: String,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerId: {
        type: String,
        required: true,
    },
    review: {
        type: String,
        required: true,
        default: "",
    },
    customerRating: {
        type: Number,
        required: true,
        default: 1,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    replies: [replySchema], // Thêm trường replies
});

// Tạo virtual property 'id'
productReviewsSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Định nghĩa model
const ProductReviews = mongoose.model('ProductReviews', productReviewsSchema);

module.exports = { ProductReviews };
