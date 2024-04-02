const mongoose = require("mongoose");
const validator = require("validator");
const bycrypt = require("bcryptjs");

//Creating the schema for the user
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    minlength: 1,
  },
  email: {
    type: String,
    required: [true, "Please provide an email address"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      //works only on CREATE and SAVE
      validator: function (el) {
        return el === this.password; //check if password is same r: t/f
      },
      message: "Passwords does not match",
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  points: {
    type: Number,
    default: 0,
  },
  username: String,
  // Feild to for friends
  friends: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  Rank: {
    type: Number,
    default: 1,
  },
});

//Password Encryption using bycrypt
/*Pre save middleware will run between recieving the data saving 
it into the DB*/
//This middleware is used for hashing the password at SIGNUP
userSchema.pre("save", async function (next) {
  //If the password has not been modified return
  if (!this.isModified("password")) return next();

  //higher the cost - higher CPU power needed
  //using the async version so that it does not block the event loop
  this.password = await bycrypt.hash(this.password, 12);

  //delete password confirm fields
  this.passwordConfirm = undefined;
  next();
});

//This middleware is used by the /login route to check the password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bycrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;

