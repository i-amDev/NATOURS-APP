const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const JWT_SECRET = "my-ultra-secure-and-ultra-long-secret";

    const JWT_EXPIRATION = 60 * 60 * 1000;

    const token = jwt.sign({id : newUser._id}, JWT_SECRET, {expiresIn: JWT_EXPIRATION});

    res.status(201).json({
        status: "success",
        token,
        data : {
            user: newUser,
        }
    });
});