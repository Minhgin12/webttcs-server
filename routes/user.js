const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const router = express.Router();
const mongoose = require('mongoose');


router.post("/authWithGoogle", async (req, res) => {
  const { name, phone, email, password, images } = req.body;

  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if ( !existingUser ) {
        // Mã hóa mật khẩu nếu có
        let hashedPassword = null;
        if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        
        const newUser = await User.create({
        name: name,
        email: email,
        password: hashedPassword, // Sử dụng mật khẩu đã mã hóa
        images: images,
        phone: phone,
        });

        // Tạo JWT token
        const token = jwt.sign(
            { email: newUser.email, id: newUser._id },
            process.env.JSON_WEB_TOKEN_SECRET_KEY,
            { expiresIn: "1h" } // Token hết hạn sau 1 giờ
        );

        // Trả về thông tin người dùng và token
        res.status(200).json({
            user: newUser,
            token: token,
            msg: "Login success!!", // Sửa typo từ mag thành msg
        });    
    } else {
        const existingUser = await User.findOne( { email: email});
        const token = jwt.sign({ email: existingUser.email, id: existingUser._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

        res.status(200).json({
            user: existingUser,
            token: token,
            msg: "Login Successfully"
        })
    }

   
  } catch (error) {
    console.error("Error during Google authentication:", error);
  }
});


// Route đăng ký người dùng
router.post('/signup', async (req, res) => {
    const { name, phone, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email đã được sử dụng!' });

        const hashPassword = await bcrypt.hash(password,10);
       const result = await User.create({
        name:name,
        phone:phone,
        email:email,
        password:hashPassword
       })
const token = jwt.sign({email:result.email,id:result._id},
    process.env.JSON_WEB_TOKEN_SECRET_KEY);
        res.status(200).json({ 
            user: result,
            token: token
         })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

// Route đăng nhập người dùng
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) return res.status(404).json({ message: 'Người dùng không tồn tại!' });

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Mật khẩu không đúng!' });

        // Tạo token
        const token = jwt.sign({ email:existingUser.email,id:existingUser._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

        res.status(200).json({ 
        user:existingUser,
        token:token,
        msg:" Người dùng đã xác thực"
         })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get(`/`,async(req,res)=>{
    const userList= await User.find();
    if(!userList){
        res.status(500).json({success:false})
    }
    res.send(userList);
});

router.get(`/get/count`, async (req, res) => {
    try {
        // Gọi countDocuments mà không cần callback
        const userCount = await User.countDocuments();
        
        // Kiểm tra nếu không có người dùng
        if (userCount === 0) {
            return res.status(404).json({ success: false, message: 'Không có người dùng nào!' });
        }

        // Trả về số lượng người dùng
        res.status(200).json({ userCount });
    } catch (error) {
        // Trả về lỗi nếu có vấn đề trong truy vấn
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get(`/:id`,async(req,res)=>{
    const user= await User.findById(req.params.id);
    if(!user){
        res.status(500).json({message:"không thấy"})
    }
    res.status(200).send(user);
});

router.delete('/:id', async (req, res) => {
    try {
        // Kiểm tra xem ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        }

        // Tìm và xóa người dùng theo ID
        const user = await User.findByIdAndDelete(req.params.id);

        // Kiểm tra nếu người dùng tồn tại
        if (user) {
            return res.status(200).json({ success: true, message: 'Xóa thành công người dùng' });
        } else {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }
    } catch (err) {
        // Xử lý lỗi từ MongoDB hoặc các lỗi khác
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { name, phone, email, password, images } = req.body;

    // Kiểm tra nếu ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    try {
        // Tìm người dùng hiện tại
        const userExist = await User.findById(req.params.id);
        if (!userExist) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Xử lý mật khẩu nếu được cung cấp
        let newPassword = userExist.password;
        if (password) {
            newPassword = await bcrypt.hash(password, 10);
        }

        // Cập nhật thông tin người dùng
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                phone,
                email,
                password: newPassword,
                images,
            },
            { new: true } // Trả về thông tin người dùng sau khi cập nhật
        );

        res.status(200).json({
            
            data: updatedUser, // Dữ liệu người dùng đã cập nhật, nếu cần
        });
    } catch (error) {
        res.status(500).json({ message: 'Cập nhật thông tin không thành công', error: error.message });
    }
});

// Route thay đổi mật khẩu
router.put('/change-password/:id', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Kiểm tra xem dữ liệu có được gửi đúng không
    console.log("Received data:", req.body);

    try {
        // Tìm người dùng trong cơ sở dữ liệu
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không đúng!' });
        }

        // Mã hóa mật khẩu mới
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Cập nhật mật khẩu mới
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Mật khẩu đã được thay đổi thành công!' });
    } catch (error) {
        console.error("Error occurred during password change:", error);
        res.status(500).json({ message: 'Lỗi server!', error: error.message });
    }
});

module.exports = router;
