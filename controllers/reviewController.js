const Review = require("../models/reviewModel");
const functionFactory = require("./functionHandler");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllReviews = functionFactory.getAll(Review);
exports.getReview = functionFactory.getOne(Review);
exports.deleteReview = functionFactory.deleteOne(Review); //DELETE REVIEW - ADMIN ONLY

//POST REVIEW - USER ONLY
exports.postReview = catchAsync(async (req, res, next) => {
  const regReview = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    course: req.body.courseId,
    user: req.user._id,
  });
  res.status(200).json({ status: "success", data: { regReview } });
});
