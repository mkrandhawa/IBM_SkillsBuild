const mongoose = require("mongoose");
const User = require("./userModel");
const Course = require("./courseModel");

// Creating the Progress schema
const progressSchema = new mongoose.Schema({
  timeStart: {
    type: Date,
    default: Date.now, // Automatically set to the current date and time when a new document is created
  },
  timeCompleted: Date,
  user: {
    type: mongoose.Schema.ObjectId, // The ID of the user who clicked the link
    ref: "User", // References the User model
    required: [true, "Progress must be associated with a user"],
  },
  course: {
    type: mongoose.Schema.ObjectId, // The ID of the course thats  clicked
    ref: "Course", // References the Course model
    required: [true, "Progress must be associated with a course"],
  },
});

const Progress = mongoose.model("Progress", progressSchema);

module.exports = Progress;
