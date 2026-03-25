const express = require("express");

const tourController = require("./../controllers/tourController");

const router = express.Router();

router.get("/", tourController.getAllTours);

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
