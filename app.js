const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorController");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// Set Security HTTP headers
app.use(helmet());

app.use(morgan("dev"));

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!"
});
app.use("/api", limiter);

// To use middleware -> which help in getting the request.body object inside the callback function.
app.use(express.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: ["duration", "ratingsQuantity", "ratingsAverage", "maxGroupSize", "difficulty", "price"]
}));

app.use(express.static(`${__dirname}/public`));

app.use((request, response, next) => {
    request.requestTime = new Date().toISOString();
    next();
});

// app.get("/", (request, response) => {
//   response
//     .status(200)
//     .json({ message: "Hello from the server side!🖥", app: "Natours" });
// });

// app.post("/", (request, response) => {
//   response.send("You can post to this endpoint...");
// });

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.use((request, response, next) => {
    // response.status(404).json({
    //     status: "Fail",
    //     message: `Can't find ${request.originalUrl} on this server`
    // });

    // const error = new Error(`Can't find ${request.originalUrl} on this server`);
    // error.status = "Fail";
    // error.statusCode = 404;

    next(new AppError(`Can't find ${request.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;