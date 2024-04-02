const Course = require("../models/courseModel");
const User = require("../models/userModel");
const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Progress = require("../models/progressModel");
const mongoose = require("mongoose");

//USER

//User dashboard
exports.dashboard = catchAsync(async (req, res, next) => {
  //1) GET course DATA FROM COLLECTION
  const userId = req.user._id;

  const courses = await Course.find({ users: userId }).populate("users");

  const progress = await Progress.find({
    user: userId,
  });

  //all course data will retrieved and passed to the template
  res.status(200).render("dashboard", {
    title: "Dashboard",
    courses,
    progress,
  });
});

//Get all the courses
exports.getCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find();

  const top3Courses = await Course.aggregate([
    {
      $lookup: {
        from: "progresses", // The collection to join
        localField: "_id", // Field from the courses collection
        foreignField: "course", // Field from the progresses collection matching localField
        as: "completedProgresses", // The array field name where the joined documents will be placed
      },
    },
    {
      $project: {
        name: 1,
        summary: 1,
        slug: 1,
        imageCover: 1,
        coursePoints: 1,
        completedCount: {
          $size: {
            $filter: {
              input: "$completedProgresses",
              as: "progress",
              cond: { $ne: ["$$progress.timeCompleted", null] }, // Only count progresses with a non-null timeCompleted
            },
          },
        },
      },
    },
    { $sort: { completedCount: -1 } }, // Sort by completedCount in descending order
    { $limit: 3 }, // Limit to the top 3
  ]);

  res
    .status(200)
    .render("courses", { title: "All courses", courses, top3Courses });
});

//Get specific course page
exports.getCourse = catchAsync(async (req, res, next) => {
  //1) GET THE DATA including reviews and users
  const course = await Course.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });
  //NO COURSE ERROR HANDLING
  if (!course) {
    return next(new AppError("There is no course with that name", 404));
  }
  //2) BUILD TEMPLATE

  //3) RENDER TEMPLATE USING THE DATA FROM STEP 1
  res.status(200).render("course", {
    title: `${course.name} Course`,
    course,
  });
});

// Get login form
exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};

//Get sign up form
exports.getSignupForm = (req, res) => {
  res.status(200).render("register", {
    title: "Register Now",
  });
};

//Get the landing page
exports.getLanding = (req, res) => {
  res.status(200).render("landing", {
    title: "Welcome",
  });
};

//Post review
exports.postReview = catchAsync(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });
  res.status(200).render("review", {
    title: "Review",
    course,
  });
});

//Get the course (Simulation)
exports.getCourseOverview = catchAsync(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });
  res.status(200).render("ibmCourse", {
    title: course.name,
    course,
  });
});

//Get user account
exports.getUserAccount = (req, res) => {
  res.status(200).render("user/userAccount", {
    title: "Your account",
  });
};

//Get photo upload page
exports.getUploadPhoto = (req, res) => {
  res.status(200).render("user/updatePicture", {
    title: "Update Picture",
  });
};

//Upload picture
exports.uploadPhoto = catchAsync(async (req, res, next) => {
  console.log(req);
  if (req.file) {
    const user = req.user._id;
    const updatedUser = await User.findByIdAndUpdate(
      user,
      {
        photo: req.file.filename,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).render("user/updatePicture", {
      title: "Upload Picture",
      user: updatedUser,
    });
  } else {
    next(new AppError("No file uplaoded", 400));
  }
});
// Friend leaderboard
exports.friendsLeaderboard = catchAsync(async (req, res, next) => {
  const userId = req.user._id; // Getting user id

  // Find the user with their friends' details populated
  const userWithFriends = await User.findById(userId).populate(
    "friends",
    "name username points Rank"
  );

  if (!userWithFriends) {
    return next(new AppError("User not found", 404));
  }

  // Sorting the friends based on points in descending order
  const sortedFriends = userWithFriends.friends.sort(
    (a, b) => b.points - a.points
  );

  // Returning the sorted friends list, including their ranks
  res.status(200).render("user/friendsLeaderboard", {
    title: "Leaderboard",
    leaderboard: sortedFriends,
  });
});
//View Friends
exports.friends = catchAsync(async (req, res, next) => {
  const userId = req.user._id; // Getting user id

  // Find the user with their friends' details populated
  const userWithFriends = await User.findById(userId).populate(
    "friends",
    "username name Rank"
  );

  if (!userWithFriends) {
    return next(new AppError("User not found", 404));
  }
  // Returning the sorted friends list, including their ranks
  res.status(200).render("user/friends", {
    title: "Friends",
    friend: userWithFriends.friends,
  });
});

//Get Level
exports.getLevel = catchAsync(async (req, res, next) => {
  res.status(200).render("user/badges", { title: "Achievements" });
});

//Search for Friends
exports.searchFriend = catchAsync(async (req, res, next) => {
  const username = req.query.search;

  // Initialize an empty array for users
  let users = [];
  let text;

  // Only search for the user if a username is provided
  if (username) {
    console.log("i am username", username);
    const user = await User.findOne({ username: username });

    if (user) {
      users.push(user);
    } else {
      // If no user is found, set a message to be displayed
      text = `No user with username "${username}" found. System is case sensitive!`;
    }
  }

  // Render the page with the users array and the message
  return res.status(200).render("user/addFriend", {
    title: "Search Friend",
    users,
    text,
  });
});

//ADMIN

//Function to determine the class colors
const getClassByDifference = (diff) => {
  if (diff === 0) {
    return "green"; // All students have started or completed
  } else if (diff === 1) {
    return "yellow"; // Only one student hasn't started or completed
  } else {
    return "red"; // More than one student hasn't started or completed
  }
};

//Admin Dashboard
exports.adminDashboard = catchAsync(async (req, res, next) => {
  res.status(200).render("admin/adminDashboard", {
    title: "Dashboard",
  });
});

//Get admin account
exports.getAdminAccount = (req, res) => {
  res.status(200).render("admin/adminAccount", {
    title: "Your account",
  });
};

// Get all the reviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
  // Find the course by its slug
  const slug = req.params.slug;
  const course = await Course.findOne({ slug: slug });

  if (!course) {
    return next(new AppError("No course found with that slug", 404));
  }

  const reviews = await Review.find({ course: course._id })
    .populate("user", "name")
    .populate("course", "name");

  res.status(200).render("admin/reviews", {
    title: "Reviews",
    reviews,
  });
});

//Delete Review
exports.deleteReview = async (req, res) => {};

exports.adminCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find();

  res.status(200).render("admin/adminCourses", {
    title: "Admin",
    courses,
  });
});

//Page for the comments
exports.adminCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find();

  res.status(200).render("admin/adminCourses", {
    title: "Admin",
    courses,
  });
});

// Page for statiatics
exports.adminStats = catchAsync(async (req, res, next) => {
  const courses = await Course.find();

  res.status(200).render("admin/adminStats", {
    title: "Admin",
    courses,
  });
});

//Course statistics - Tot number od students, number of students who started the course and finished
exports.courseStats = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const course = await Course.findOne({ slug: slug });
  const totUser = course.users.length; //total enrolled students in that course

  //STUDENTS WHO STARTED THE COURSE - Counts all the documents that has the course id
  const totStart = await Progress.countDocuments({ course: course._id });

  //STUDENTS WHO COMPLETED THE COURSE

  //counts the document that have got the timeCompleted field
  const totCompleted = await Progress.countDocuments({
    timeCompleted: { $exists: true },
    course: new mongoose.Types.ObjectId(course._id),
  });

  if (totUser == 0 && totCompleted == 0 && totStart == 0) {
    (totUser = 0), (totCompleted = 0);
    totStart = 0;
  }

  // Calculate the differences
  const diffStart = totUser - totStart;
  const diffCompleted = totUser - totCompleted;

  // Determine the class based on the difference
  const classForStart = getClassByDifference(diffStart);
  const classForCompleted = getClassByDifference(diffCompleted);

  res.status(200).render("admin/courseStats", {
    title: "Statistics",
    course,
    totUser,
    totStart,
    totCompleted,
    classForStart,
    classForCompleted,
  });
});
