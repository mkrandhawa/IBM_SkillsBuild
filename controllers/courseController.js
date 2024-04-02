const Course = require("../models/courseModel");
const functionFactory = require("./functionHandler");
const catchAsync = require("../utils/catchAsync");

exports.getAllCourse = functionFactory.getAll(Course);
exports.getCourse = functionFactory.getOne(Course);

//Get Top 3 Courses
exports.getTop3Courses = catchAsync(async (req, res, next) => {
  try {
    const topCourses = await Course.aggregate([
      {
        $project: {
          name: 1,
          numberOfUsers: { $size: "$users" }, // Count the number of users enrolled
        },
      },
      { $sort: { numberOfUsers: -1 } }, // Sort by numberOfUsers in descending order
      { $limit: 3 }, // Limit to top 3
    ]);

    res.status(200).json({
      status: "success",
      data: {
        courses: topCourses,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
});

//COURSES WITH RATING <=3
exports.getStats = catchAsync(async (req, res, next) => {
  const courses = await Course.find({ ratingsAverage: { $lte: 3 } });

  res.status(200).json({ status: "success", data: { courses: courses } });
});
