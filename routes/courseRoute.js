const express = require("express");
const authController = require("../controllers/authController");
const courseController = require("../controllers/courseController");
const progressController = require("../controllers/progressController");

const router = express.Router(); //creating the router

router.get("/", authController.protect, courseController.getAllCourse); //home route

//GET COURSES WITH RATING <=3
router
  .route("/stats")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    courseController.getStats
  );

router.get("/:id", authController.protect, courseController.getCourse); //get one course

router.post(
  "/start/:courseId",
  authController.protect,
  progressController.progressStart
);

router.patch(
  "/complete/:courseId",
  authController.protect,
  progressController.progressComplete
);

module.exports = router;
