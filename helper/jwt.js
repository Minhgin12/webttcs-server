// const expressJwt = require('express-jwt');

// function authJwt() {
//     const secret = process.env.JSON_WEB_TOKEN_SECRET_KEY;
//     return expressJwt({
//         secret: secret,
//         algorithms: ["HS256"]
//     }).unless({
//         path: [
//             '/api/user/signin', // hoặc các route không yêu cầu xác thực
//             '/api/user/signup' // thêm các đường dẫn không yêu cầu JWT
//         ]
//     });
// }

// module.exports = authJwt;
