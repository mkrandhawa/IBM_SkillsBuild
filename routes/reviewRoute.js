const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

//Authentication
router.use(authController.protect); //protecting the below routes

//GET ALL THE REVIEWS AND CREATE A REVIEW
router.route("/").get(reviewController.getAllReviews);

router.post(
  "/:id",
  authController.restrictTo("user"), //only the users can post reviews
  reviewController.postReview
);

//DELETE REVIEW WITH GIVEN ID
router.delete(
  "/:id",
  authController.restrictTo("admin"),
  reviewController.deleteReview
);

module.exports = router;
