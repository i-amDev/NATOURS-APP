const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync")
const User = require("./../models/userModel");
const factory = require("./handlerFactory");

exports.getAllUsers = catchAsync(async (request, response) => {
    const users = await User.find();

    // SEND RESPONSE
    response.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(element => {
        if (allowedFields.includes(element)) {
            newObj[element] = obj[element];
        }
    });
    return newObj;
};

exports.updateMe = catchAsync(async (request, response, next) => {
    // Create error if user POST password data
    if (request.body.password || request.body.passwordConfirm) {
        return next(new AppError("This route is not for password updates.", 400));
    }

    // Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(request.body, "name", "email");

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(request.user.id, filteredBody, {new: true, runValidators: true});

    response.status(404).json({
        status: "success",
        data: {
            user: updatedUser,
        }
    });
});

exports.deleteMe = catchAsync(async (request, response, next) => {
    await User.findByIdAndUpdate(request.user.id, {active: false});

    response.status(204).json({
        status: "success",
        data: null
    });
});

exports.createUser = (request, response) => {
    response.status(500).json({
        status: "Error",
        message: "This route is not defined. Please use /signup instead",
    });
};

// exports.getUserById = (request, response) => {
//     response.status(500).json({
//         status: "Error",
//         message: "This route is not yet defined",
//     });
// };
exports.getUserById = factory.getOne(User);

// exports.updateUser = (request, response) => {
//     response.status(500).json({
//         status: "Error",
//         message: "This route is not yet defined",
//     });
// };
// Do not update passwords with this!
exports.updateUser = factory.updateOne(User);

// exports.deleteUser = (request, response) => {
//     response.status(500).json({
//         status: "Error",
//         message: "This route is not yet defined",
//     });
// };

exports.deleteUser = factory.deleteOne(User);