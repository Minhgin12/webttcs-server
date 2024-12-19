const mongoose = require('mongoose')

const productReviewsSchema = mongoose.Schema({
    productId:{
        type: String,
        require: true
    },
    customerName:{
        type: String,
        require: true
    },
    customerId:{
        type: String,
        require: true
    },
    review:{
        type: String,
        require: true,
        default:""
    },
    customerRating:{
        type:Number,
        required:true,
        default:1
    },
    dateCreated:{
        type:Date,
        default:Date.now,
    }
})
productReviewsSchema.virtual('id').get(function(){
    return this._id.toHexString();
})
const ProductReviews = mongoose.model('ProductReviews', productReviewsSchema);
module.exports = { ProductReviews };