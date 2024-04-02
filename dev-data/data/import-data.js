const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Course = require("./../../models/courseModel");
const User = require("./../../models/userModel");
const Review = require("./../../models/reviewModel");

dotenv.config({ path: "./config.env" });

//connecting to the local database. You can also decide to connect to the one hosted on Atlas
mongoose
  .connect(process.env.DATABASE, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB Connection successful"));

//READ JSON FILE
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/courses.json`, "utf-8")
); //convert into JS object
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8")); //convert into JS object
// const reviews = JSON.parse(
//   fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
//); //convert into JS object

//IMPORT DATA INTO DATABASE
//node ./dev-data/data/import-data.js --import
const importData = async () => {
  try {
    await Course.create(courses);
    // await User.create(users, { validateBeforeSave: false });
    //await Review.create(reviews);
    console.log("Data successfully loaded");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
console.log(courses);

//DELETE ALL DATA FROM COLLECTION/DB
//node ./dev-data/data/import-data.js --delete
const deleteData = async () => {
  try {
    await Course.deleteMany();
    // await User.deleteMany();
    //await Review.deleteMany();
    console.log("Data successfully deleted");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  //import all data through console

  importData();
} else if (process.argv[2] === "--delete") {
  //delete all data through console

  deleteData();
}

console.log(process.argv);
