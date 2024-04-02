const userController = require("../controllers/userController");
const authController = require("./../controllers/authController");
const pointsController = require("./../controllers/pointsController");
const express = require("express");

const router = express.Router();

//ACCOUNT
router.get("/me", userController.getMe, userController.getUser);
//SIGNUP
router.post("/signup", authController.registerUser);
//LOGIN
router.post("/login", authController.login);
//LOGOUT
router.get("/logout", authController.protect, authController.logout); //the user can logout only if he is logged in
//DASHBOARD
router.get("/dashboard", authController.protect, userController.getUserCourses);
//ENROLL ME
router.post(
  "/enrollMe/:courseId",
  authController.protect,
  userController.enrollMe
);

//ADD/UPDATE PROFILE PICTURE
router.patch(
  "/updateMe",
  authController.protect, //allows access to the logged in users.
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

//ADDING A FRIEND
router.patch(
  "/addFriend/:friendId",
  authController.protect,
  userController.addFriend
);
//GET STUDENTS DATA
router.get(
  "/analytics/:courseId",
  authController.protect,
  authController.restrictTo("admin"),
  userController.analytics
);
router.get('/search/:username', authController.protect, userController.searchUserByUsername);

module.exports = router;
