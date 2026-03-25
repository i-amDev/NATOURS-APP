const Tour = require("./../models/tourModel");
const APIFeatures = require("./../utils/apiFeatures");

exports.aliasTopTours = (request, response, next) => {
    console.log("Query - ", request.query);
    request.query.limit = "5";
    request.query.sort = "-ratingsAverage,price";
    request.query.fields = "name,price,ratingsAverage,summary,difficulty";
    next();
}

// Route Handlers
exports.getAllTours = async (request, response) => {
    try {
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
    } catch (error) {
        response.status(400).json({
            status: "fail",
            message: error.message,
        })
    }

};

exports.createTour = async (request, response) => {
    try {
        const newTour = await Tour.create(request.body);
        response.status(201).json({
            status: "success",
            data: {
                tours: newTour
            }
        })
    } catch (error) {
        response.status(400).json({
            status: "fail",
            message: error.message,
        })
    }

};

exports.getTourById = async (request, response) => {
    try {
        const tour = await Tour.findById(request.params.id);

        response.status(200).json({
            status: "success",
            data: {
                tour,
            },
        });
    } catch (error) {
        response.status(400).json({
            status: "fail",
            message: error.message,
        })
    }
};

exports.updateTour = async (request, response) => {
    try {
        const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
            new: true
            , runValidators: true
        });
        response.status(200).json({
            status: "Success",
            data: {
                tour
            },
        });
    } catch (error) {
        response.status(400).json({
            status: "fail",
            message: error.message,
        })
    }
};

exports.deleteTour = async (request, response) => {
    try {
        await Tour.findByIdAndDelete(request.params.id);
        response.status(204).json({
            status: "Success",
            data: null,
        });
    } catch (error) {
        response.status(400).json({
            status: "fail",
            message: error.message,
        })
    }
};

exports.getTourStats = async (request, response) => {
    try {
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
    } catch (error) {
        response.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
}

exports.getMonthlyPlan = async (request, response) => {
    try {
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
    } catch
        (error) {
        response.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
}