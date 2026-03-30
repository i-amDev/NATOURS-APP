const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");

const JWT_SECRET = "my-ultra-secure-and-ultra-long-secret";

const JWT_EXPIRATION = 60 * 60 * 1000;

const signToken = id => {
    return jwt.sign({id: id}, JWT_SECRET, {expiresIn: JWT_EXPIRATION})
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser,
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    // Check if the email and password exists
    if (!email || !password) {
        return next(new AppError("Please provide an email and password", 400));
    }
    // Check if user exists and password is correct
    const user = await User.findOne({email}).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    // If everything ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
        status: "success",
        token
    });
});