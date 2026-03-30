const express = require("express");

const tourController = require("./../controllers/tourController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/top-5-cheap").get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);

router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router.get("/", authController.protect, tourController.getAllTours);

router.post("/", tourController.createTour);

router.get("/:id", tourController.getTourById);

router.patch("/:id", tourController.updateTour);

router.delete("/:id", tourController.deleteTour);

// Another way of writing these five endpoints

// app.route("/api/v1/tours").get(getAllTours).post(createTour);

// app
//   .route("/api/v1/tours/:id")
//   .get(getTourById)
//   .patch(updateTour)
//   .delete(deleteTour);

module.exports = router;
