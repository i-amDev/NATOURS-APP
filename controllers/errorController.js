const AppError = require("../utils/appError");

const handleJWTError = () =>
    new AppError('Invalid token. Please log in again!', 401);

module.exports = (error, request, response, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "Error";

    if (error.name === 'TokenExpiredError') error = handleJWTError();

    response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
    });
};