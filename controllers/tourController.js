const Tour = require("./../models/tourModel");

// Route Handlers
exports.getAllTours = async (request, response) => {
    try {
        const tours = await Tour.find();

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
