const Progress = require("../models/progressModel");
const User = require("../models/userModel");
const Course = require("../models/courseModel");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");

exports.progressStart = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const courseId = req.body.courseId;

  try {
    // Find the progress document based on the user and course IDs
    let progress = await Progress.findOne({ user: userId, course: courseId });

    if (!progress) {
      // If progress document doesn't exist, create a new one
      progress = await Progress.create({
        user: userId,
        course: courseId,
        timeStart: new Date(), // Set the start time to the current date and time
      });
    } else {
      // If progress document exists but timeStart is not set, update it
      progress.timeStart = new Date();
      await progress.save();
    }

    res.status(200).json({ status: "success", data: progress });
  } catch (err) {
    // Handle any errors
    return next(new appError("Internal server error", 500));
  }
});
//UPDATING USER RANK
const updateUserRank = async (userId) => {
  const user = await User.findById(userId);

  // Calculates new rank based on current points
  let newRank;
  if (user.points >= 2000) {
    newRank = 5;
  } else if (user.points >= 1500) {
    newRank = 4;
  } else if (user.points >= 1000) {
    newRank = 3;
  } else if (user.points >= 500) {
    newRank = 2;
  } else if (user.points >= 100) {
    newRank = 1;
  } else {
    newRank = 0;
  }
  // Updates user's rank
  if (user.Rank !== newRank) {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { Rank: newRank },
      { new: true }
    );
    return updatedUser;
  }

  // Returns the user as is if the rank hasn't changed
  return user;
};

exports.progressComplete = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const courseId = req.body.courseId;

  // Find the relevant progress document
  const progress = await Progress.findOne({ user: userId, course: courseId });

  if (!progress) {
    return next(new appError("Progress not found", 404));
  }

  // Update the timeCompleted field to the current date and time
  progress.timeCompleted = new Date();

  // Save the updated progress document
  await progress.save();

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new appError("Course not found", 404));
  }

  // Adding course points to user's points in the database
  const userPoints = await User.findByIdAndUpdate(
    userId,
    { $inc: { points: course.coursePoints } },
    { new: true }
  );
  //calling fuction to update users rank
  await updateUserRank(userId);

  res.status(200).json({ status: "success", data: { userPoints, progress } });
});
