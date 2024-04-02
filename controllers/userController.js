const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const functionFactory = require("./functionHandler");
const Course = require("../models/courseModel");
const appError = require("../utils/appError");
const multer = require("multer");
const sharp = require("sharp");
const Progress = require("../models/progressModel");
const mongoose = require("mongoose");

exports.getUser = functionFactory.getOne(User);

// Enroll user in a course
exports.enrollMe = catchAsync(async (req, res, next) => {
  const courseId = req.params.courseId; //getting it from the url
  const { user } = req; //getting it from the req
  const userId = user._id;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new appError("Course not found", 404));
  }

  const isEnrolled = course.users.some((userInCourse) =>
    userInCourse._id.equals(userId)
  );

  //Check if the user is already enrolled in the course
  if (isEnrolled) {
    return next(new appError("You are already enrolled in this course", 400));
  }

  //check if the user is admin
  if (user.role === "admin") {
    return next(new appError("You do not have the permission to enroll.", 400));
  }

  //if not enrolled and the couse exists --> enroll user
  course.users.push(user._id);
  await course.save();
  res.status(201).json({ status: "success", data: { course } });
});
// Get courses enrolled by user
exports.getUserCourses = catchAsync(async (req, res, next) => {
  const { user } = req;

  // Find all courses where the user is enrolled
  const courses = await Course.find({ users: user._id });

  res.status(200).json({ status: "success", data: { courses } });
});

//IMAGE STORED AS A BUFFER
const multerStorage = multer.memoryStorage();

//MULTER FILTER - Upload files that are only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    //the mimetype will always be image
    cb(null, true);
  } else {
    cb(
      new appError("Not an image file! Please upload only images.", 400),
      false
    );
  }
};

//CONFIGURE MULTER
const upload = multer({ storage: multerStorage, fileFilter: multerFilter }); //folder where you want to save the images that are being uploaded
exports.uploadUserPhoto = upload.single("photo");

//IMAGE PROCESSING - RESIZING THE FILE AND SAVE TO BUFFER/MEMORY
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpg`; //the format: user-userId-date.jpeg

  sharp(req.file.buffer)
    .resize(500, 500) //the size if 500x500
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`); //resizing the images, changing the extension, compressing it

  next();
};

//UPDATE USER IMAGE
exports.updateMe = catchAsync(async (req, res, next) => {
  //2) Filter out unwanted fields names that are not allowed to be updated
  //name and email are fields that we want to keep
  const filterBody = filterObj(req.body, "name", "email");
  //if in case there is a file then  add the file
  if (req.file) filterBody.photo = req.file.filename;

  //3)Update the user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  //loop through all the fields of the object and add them to newObj if they are in the
  //allowedfields array
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//GET TOTAL NUMBER OF STUDENTS THAT ARE ENROLLED,  STARTED, COMPLETED THE COURSE
exports.analytics = catchAsync(async (req, res, next) => {
  const courseId = req.params.courseId; //getting the course ID
  const course = await Course.findById(courseId); //getting the course

  const totUser = course.users.length; //total enrolled students in that course

  //STUDENTS WHO STARTED THE COURSE
  const totStart = await Progress.countDocuments(courseId);

  //STUDENTS WHO COMPLETED THE COURSE

  //counts the document that have got the timeCompleted field
  const totCompleted = await Progress.countDocuments({
    timeCompleted: { $exists: true },
    course: mongoose.Types.ObjectId(courseId),
  });

  if (totUser == 0 && totCompleted == 0 && totStart == 0) {
    return res.status(200).json({ status: "success", data: 0 });
  } else {
    return res
      .status(200)
      .json({ status: "success", data: { totUser, totStart, totCompleted } });
  }
});

//ADDING FRIENDS
exports.addFriend = catchAsync(async (req, res, next) => {
  const friendId = req.params.friendId; // Getting the friend's ID from the URL
  const userId = req.user._id; // Getting the current user's ID from the request object

  // Prevent users from adding themselves as a friend
  if (friendId === userId.toString()) {
    return next(new appError("You cannot add yourself as a friend", 400));
  }

  // Check if the friendId is valid
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return next(new appError("Invalid friend ID", 400));
  }

  // Check if the friend to add exists
  const friendExists = await User.findById(friendId);
  if (!friendExists) {
    return next(new appError("Friend not found", 404));
  }

  // Check if the user is already a friend for both users
  const user = await User.findById(userId);
  const isAlreadyFriend = user.friends.some(
    (friend) => friend.toString() === friendId
  );

  const friendAlreadyAdded = friendExists.friends.some(
    (friend) => friend.toString() === userId.toString()
  );

  if (isAlreadyFriend && friendAlreadyAdded) {
    return next(new appError("This user is already your friend", 400));
  }

   // Add friend to the user's friends list if not already added
  if (!isAlreadyFriend) {
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { friends: friendId } }, // $addToSet adds a value to an array unless the value is already present
      { new: true }
    );
  }

  // Similarly, add the current user to the friend's friends list if not already added
  if (!friendAlreadyAdded) {
    await User.findByIdAndUpdate(
      friendId,
      { $addToSet: { friends: userId } },
      { new: true }
    );
  }

  res.status(201).json({
    status: "success",
    message: "Friend added successfully",
  });
});

// Search for user by username
exports.searchUserByUsername = catchAsync(async (req, res, next) => {
  // Extract the search query from the request parameters or query string
  const { username } = req.params;

  // Search for the user by username
  const user = await User.findOne({ username: username }).select(
    "username name _id Rank"
  );

  // If no user is found, return an error
  if (!user) {
    return next(new appError("No user found with that username", 404));
  }

  // If user is found, return the user details
  res.status(200).render("user/addFriend", {
    username: user.username,
    name: user.name,
    id: user._id,
    rank: user.Rank,
  });
});

// /ME ENDPOINT
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
