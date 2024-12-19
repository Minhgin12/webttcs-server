const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    images: [
        {
        type: String,
        required: true
}]
});

// Mã hóa mật khẩu trước khi lưu vào database
userSchema.virtual('id').get(function (){
    return this._id.toHexString();
});
userSchema.set('toJSON',{
    virtuals:  true,
})
exports.User = mongoose.model('User', userSchema);
exports.userSchema=userSchema;
