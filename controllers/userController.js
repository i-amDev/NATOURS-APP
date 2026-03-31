const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync")

exports.getAllUsers = (request, response) => {
    response.status(500).json({
        status: "Error",
        message: "This route is not yet defined",
    });
};

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

exports.createUser = (request, response) => {
    response.status(500).json({
        status: "Error",
        message: "This route is not yet defined",
    });
};

exports.getUserById = (request, response) => {
    response.status(500).json({
        status: "Error",
        message: "This route is not yet defined",
    });
};

exports.updateUser = (request, response) => {
    response.status(500).json({
        status: "Error",
        message: "This route is not yet defined",
    });
};

exports.deleteUser = (request, response) => {
    response.status(500).json({
        status: "Error",
        message: "This route is not yet defined",
    });
};
