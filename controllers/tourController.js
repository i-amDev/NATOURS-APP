const Tour = require("./../models/tourModel");
const APIFeatures = require("./../utils/apiFeatures");
const {request} = require("express");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

exports.aliasTopTours = (request, response, next) => {
    console.log("Query - ", request.query);
    request.query.limit = "5";
    request.query.sort = "-ratingsAverage,price";
    request.query.fields = "name,price,ratingsAverage,summary,difficulty";
    next();
}

// Route Handlers
exports.getAllTours = catchAsync(async (request, response) => {
    console.log("Query", request.query);
    // Build Query
    // Filtering
    // const queryObject = {...request.query};
    // const excludedFields = ["page", "sort", "limit", "fields"];
    // excludedFields.forEach(element => delete queryObject[element]);
    //
    // // Advance Filtering
    // let queryStr = JSON.stringify(queryObject);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log("Parsed - ", JSON.parse(queryStr));

    // let query = Tour.find(JSON.parse(queryStr));

    // Sorting
    // if (request.query.sort) {
    //     const sortBy = request.query.sort.split(",").join(" ");
    //     console.log(sortBy);
    //     query = query.sort(sortBy);
    // } else {
    //     query = query.sort("-createdAt");
    // }

    // Field Limiting
    // if (request.query.fields) {
    //     const fields = request.query.fields.split(",").join(" ");
    //     query = query.select(fields);
    // } else {
    //     query = query.select("-__v");
    // }

    // Pagination
    // const page = request.query.page * 1 || 1;
    // const limit = request.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    //
    // query = query.skip(skip).limit(limit);
    //
    // if (request.query.page) {
    //     const numOfTours = await Tour.countDocuments();
    //     if (numOfTours <= skip) {
    //         throw new Error("This page doesn't exist");
    //     }
    // }

    // Execute Query
    const features = new APIFeatures(Tour.find(), request.query).filter().sort().limitFields().paginate();
    const tours = await features.query;

    // const query = await Tour.find({
    //     duration: 5,
    //     difficulty: "easy"
    // });

    // const tours = await Tour.find().where("duration").equals(5).where("difficulty").equals("easy");

    response.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            tours,
        },
    });
});

// exports.createTour = catchAsync(async (request, response, next) => {
//     const newTour = await Tour.create(request.body);
//
//     response.status(201).json({
//         status: "success",
//         data: {
//             tours: newTour
//         }
//     });
//     // try {
//     //
//     // } catch (error) {
//     //     response.status(400).json({
//     //         status: "fail",
//     //         message: error.message,
//     //     })
//     // }
// });
exports.createTour = factory.createOne(Tour);

// exports.getTourById = catchAsync(async (request, response, next) => {
//     const tour = await Tour.findById(request.params.id).populate("reviews");
//
//     if (!tour) {
//         return next(new AppError("No tour found with that ID", 404));
//     }
//
//     response.status(200).json({
//         status: "success",
//         data: {
//             tour,
//         },
//     });
// });
exports.getTourById = factory.getOne(Tour, {path: "reviews"});

// exports.updateTour = catchAsync(async (request, response, next) => {
//     const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
//         new: true
//         , runValidators: true
//     });
//
//     if (!tour) {
//         return next(new AppError("No tour found with that ID", 404));
//     }
//
//     response.status(200).json({
//         status: "Success",
//         data: {
//             tour
//         },
//     });
// });

exports.updateTour = factory.updateOne(Tour);

// exports.deleteTour = catchAsync(async (request, response, next) => {
//     const tour = await Tour.findByIdAndDelete(request.params.id);
//
//     if (!tour) {
//         return next(new AppError("No tour found with that ID", 404));
//     }
//
//     response.status(204).json({
//         status: "Success",
//         data: null,
//     });
// });

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (request, response, next) => {
    const stats = await Tour.aggregate([
        {
            $match: {ratingsAverage: {$gte: 4.5}}
        },
        {
            $group: {
                _id: {$toUpper: "$difficulty"},
                numTours: {$sum: 1},
                numRatings: {$sum: "$ratingsQuantity"},
                avgRating: {$avg: "$ratingsAverage"},
                avgPrice: {$avg: "$price"},
                minPrice: {$min: "$price"},
                maxPrice: {$max: "$price"},
            }
        },
        {
            $sort: {avgPrice: 1}
        },
        // {
        //     $match: {_id: {$ne: "EASY"}}
        // }
    ]);
    response.status(200).json({
        status: "Success",
        data: {
            stats
        },
    });

});

exports.getMonthlyPlan = catchAsync(async (request, response, next) => {
    const year = request.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: "$startDates"
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group: {
                _id: {$month: "$startDates"},
                numTourStarts: {$sum: 1},
                tours: {$push: "$name"}
            }
        },
        {
            $addFields: {month: "$_id"}
        },
        {
            $project: {
                _id: 0,

            }
        },
        {
            $sort: {numTourStarts: -1}
        },
        {
            $limit: 12
        }
    ]);
    response.status(200).json({
        status: "Success",
        data: {
            plan
        },
    });
});