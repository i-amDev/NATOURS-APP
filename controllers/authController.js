const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const {promisify} = require("util");
const sendEmail = require("./../utils/email")

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
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role,
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

exports.protect = catchAsync(async (req, res, next) => {
    // Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new AppError("You are not logged in! Please log in to get access", 401));
    }

    // Validate the token
    // const decoded = await jwt.verify(token, JWT_SECRET);
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("The user belonging to the user no longer exists", 401));
    }

    // Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError("User recently changed password! Please login again", 401));
    }

    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403));
        }
        next();
    }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // Get user based on POSTED email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return next(new AppError("There is no email address with email address", 404));
    }
    // Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    // Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forget your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \nIf you didn't forget your password, please ignore this email!`

    try {
        await sendEmail({
            email: req.body.email,
            subject: "Your password reset token (valid for 10 min)",
            message
        });

        res.status(200).json({
            status: "success",
            message: "Token sent to mail!"
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError("There was an error sending the email. Try again later!"), 500);
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
})