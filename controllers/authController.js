const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

//SIGNUP TOKEN
const signUpJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

//CREATE JWT TOKEN
const createJWT = (user, statusCode, res) => {
  const jwtToken = signUpJwtToken(user._id); //_id is unique for each user

  // Parse the JWT_EXPIRY value to extract the number of days
  const expiryDays = parseInt(process.env.JWT_EXPIRY);

  // Calculate the expiry time in milliseconds based on JWT_EXPIRY in days
  const expiryTime = expiryDays * 24 * 60 * 60 * 1000;

  const cookieJwt = {
    expires: new Date(Date.now() + expiryTime), // Set expiry time
    httpOnly: true, // Cannot be modified
  };

  res.cookie("jwt", jwtToken, cookieJwt);

  user.password = undefined; //setting the password to undefined so that it does not get printed in the output

  res.status(statusCode).json({
    status: "success",
    jwtToken, //sending back the json web token
    data: {
      user, //sending back the user data wihtout the password for security purpose
    },
  });
};

//SIGNUP
exports.registerUser = catchAsync(async (req, res, next) => {
  const username = req.body.email.split("@")[0]; //extracting user name from the email
  const regUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.cpassword,
    username: username,
  });

  //sending the jwt token for the new user
  createJWT(regUser, 201, res);
});

//LOGIN
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; //using the desctructring

  //if there is no email or password --> return error
  if (!email || !password) {
    return next(appError("Please provide email and password!", 400));
  }
  //Getting the user that has the email specified by the user
  const user = await User.findOne({ email }).select("+password");

  //Check if the user exists or if the password is correct or not
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError("Incorrect email or password!", 401)); //401 means unauthorized
  } else {
    console.log("you are logged");
  }

  //Create the JWT and send it back to the user
  createJWT(user, 200, res);
});

//LOGOUT
exports.logout = (req, res) => {
  //Sending back empty cookie
  res.cookie("jwt", "loggedout", {
    expiresIn: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

//PROTECT
exports.protect = catchAsync(async (req, res, next) => {
  //1)Get the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") //JWT is mostly in the header and starts with "Bearer"
  ) {
    token = req.headers.authorization.split(" ")[1]; //getting the JWT
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt; //If all previous case are not available get the JWT from the cookie
  }

  //Check if the token exists
  if (!token) {
    return next(
      new appError("You are not logged in! Please login to get access", 401)
    );
  }

  //2)Validate the token - Verification stage verify if the data has been manipulated or expired
  const decoded = await promisify(jwt.verify)(token, process.env.JWT);

  //3) Check if the user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new appError("The user belonging to this token no longer exists", 401)
    );
  }

  //Grant access to the protected route
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

//...roles will create an array that contains all the arguments that we have passed
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError("You do not have permission to perform this action", 403)
      ); //403=> forbidden request
    }
    next();
  };
};

//used to show a specific layout if the user is logged in
//ONLY FOR RENDERED PAGES --> NO ERROR
exports.isLoggedIn = async (req, res, next) => {
  //If there is no cookie there is no logged in user
  if (req.cookies.jwt) {
    try {
      //1)verifies the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //2) Check if the user still exists
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }

      //3)Check if user changed password after the JWT was issued#
      //iat => issued at
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      //THERE IS A LOGGED IN USER
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
