const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
//import axios from "axios";
require('dotenv/config');
const authJwt = require('./helper/jwt.js');

app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(express.json());
// app.use(authJwt());
//routes
const categoryRoutes=require('./routes/categories');
const productRoutes=require('./routes/products');
const productSizeRoutes = require('./routes/productSIZE.js');
const paymentRoutes = require('./routes/payment');
const userRoutes= require('./routes/user.js');
const myListSchema = require('./routes/myList.js')
const cart = require('./routes/cart');
const search = require('./routes/search.js')
const orderRoutes = require('./routes/order.js')


const productReviewRoutes= require('./routes/productReviews.js');
// app.use(authJwt());
app.use("/uploads",express.static("uploads"));
app.use(`/api/category`,categoryRoutes);
app.use(`/api/products`,productRoutes);
app.use(`/api/productSIZE`,productSizeRoutes);
app.use(`/api/user`,userRoutes);
app.use(`/api/cart`, cart);
app.use(`/api/payment`, paymentRoutes);
app.use(`/api/productReviews`,productReviewRoutes)
app.use(`/api/search`, search);
app.use(`/api/order`, orderRoutes );
//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
 .then(()=>{
    console.log('database connection is ready...')
    //sever
    app.listen(process.env.PORT, () => {
        console.log(`sever is running ${process.env.REACT_APP_BASE_URL}`);
    })

 }  )
 .catch((err)=>{
    console.log(err);
 } 
)
app.post("/callback", async (req, res) => {
    console.log("callback: ");
    console.log(req.body);
    return res.status(200).json(req.body);
})
const crypto = require("crypto");

// app.post("/callback", async (req, res) => {
//     console.log("callback received: ", req.body);

//     const { partnerCode, orderId, requestId, amount, orderInfo, resultCode, message, payType, responseTime, extraData, signature } = req.body;

//     // Tạo raw signature (theo thứ tự MoMo yêu cầu)
//     const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}`;
    
//     // Hash raw signature bằng secret key
//     const generatedSignature = crypto.createHmac('sha256', process.env.MOMO_SECRET_KEY).update(rawSignature).digest('hex');

//     if (generatedSignature !== signature) {
//         console.error("Invalid signature. Possible tampering detected.");
//         return res.status(400).json({ message: "Invalid signature" });
//     }

//     console.log("Signature verified successfully!");

//     // Kiểm tra trạng thái thanh toán
//     if (resultCode === 0) {
//         // Thanh toán thành công
//         console.log(`Payment successful for orderId: ${orderId}`);

//         // TODO: Update trạng thái thanh toán trong database
//         // Ví dụ:
//         // await Order.updateOne({ orderId }, { status: 'Paid' });

//         return res.status(200).json({ message: "Payment successful" });
//     } else {
//         // Thanh toán thất bại
//         console.error(`Payment failed for orderId: ${orderId}. Result code: ${resultCode}`);
//         return res.status(400).json({ message: "Payment failed" });
//     }
// });





