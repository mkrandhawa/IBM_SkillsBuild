"use strict";

var Course = require("../models/courseModel");

var catchAsync = require("../utils/catchAsync");

var AppError = require("../utils/appError");

var Progress = require("../models/progressModel");

exports.dashboard = catchAsync(function _callee(req, res, next) {
  var userId, courseId, courses, progress;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          //1) GET course DATA FROM COLLECTION
          userId = req.user._id;
          courseId = req.body.courseId;
          console.log(courseId);
          _context.next = 5;
          return regeneratorRuntime.awrap(Course.find({
            users: userId
          }).populate("users"));

        case 5:
          courses = _context.sent;
          console.log(courses._id);
          _context.next = 9;
          return regeneratorRuntime.awrap(Progress.find({
            user: userId
          }));

        case 9:
          progress = _context.sent;
          console.log("This is progress view controller", progress); //all course data will retrieved and passed to the template

          res.status(200).render("dashboard", {
            title: "Dashboard",
            courses: courses,
            progress: progress
          });

        case 12:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.getCourses = catchAsync(function _callee2(req, res, next) {
  var courses;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(Course.find());

        case 2:
          courses = _context2.sent;
          res.status(200).render("courses", {
            title: "All courses",
            courses: courses
          });

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.getCourse = catchAsync(function _callee3(req, res, next) {
  var course;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(Course.findOne({
            slug: req.params.slug
          }).populate({
            path: "reviews",
            fields: "review rating user"
          }));

        case 2:
          course = _context3.sent;

          if (course) {
            _context3.next = 5;
            break;
          }

          return _context3.abrupt("return", next(new AppError("There is no course with that name", 404)));

        case 5:
          //2) BUILD TEMPLATE
          //3) RENDER TEMPLATE USING THE DATA FROM STEP 1
          res.status(200).render("course", {
            title: "".concat(course.name, " Course"),
            course: course
          });

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  });
});

exports.getLoginForm = function (req, res) {
  console.log("I am in view controller");
  res.status(200).render("login", {
    title: "Log into your account"
  });
};

exports.getSignupForm = function (req, res) {
  res.status(200).render("register", {
    title: "Register Now"
  });
};

exports.getLanding = function (req, res) {
  res.status(200).render("landing", {
    title: "Welcome"
  });
};

exports.postReview = catchAsync(function _callee4(req, res) {
  var course;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(Course.findOne({
            slug: req.params.slug
          }));

        case 2:
          course = _context4.sent;
          res.status(200).render("review", {
            title: "Review",
            course: course
          });

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
});
exports.getCourseOverview = catchAsync(function _callee5(req, res) {
  var course;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(Course.findOne({
            slug: req.params.slug
          }));

        case 2:
          course = _context5.sent;
          res.status(200).render("courseOverview", {
            title: course.name,
            course: course
          });

        case 4:
        case "end":
          return _context5.stop();
      }
    }
  });
});