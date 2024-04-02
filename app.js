const express = require("express");
const cookieParser = require("cookie-parser");
const expressLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const appError = require("./utils/appError");
const path = require("path");
const errorHandler = require("./controllers/errorController");

const userRoute = require("./routes/userRoute");
const reviewRoute = require("./routes/reviewRoute");
const courseRoute = require("./routes/courseRoute");
const viewRoute = require("./routes/viewsRoute");
const app = express();

//Defining the view engine
app.set("view engine", "pug");
//Definining the location of the templates
app.set("views", path.join(__dirname, "views"));

//SERVING STATIC FILES accessing the static files
app.use(express.static(path.join(__dirname, "public")));

//MIDDLEWARES
//Helmet --> sets security HTTP headers
app.use(helmet());

//Limit requests from same API
const limiter = expressLimit({
  max: 100, //max number of requests per same IP
  windowMs: 60 * 60 * 1000, //1h => 100 request per hour
  message: "Too many requests sent from this IP, please try gain in an hour",
});
app.use("/v1", limiter);

//Setting the max size to be 100kb
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//Parse data from cookies
app.use(cookieParser());

//DATA SANITIZATION against NoSQL query injection
app.use(mongoSanitize()); //filter all $ signs

//DATA SANITIZATION against XSS
app.use(xssClean());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});
app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' cdnjs.cloudflare.com"
  );
  next();
});
//ROUTES
app.use("/", viewRoute);
app.use("/v1/users", userRoute);
app.use("/v1/courses", courseRoute);
app.use("/v1/reviews", reviewRoute);

//Handling unhandled requests
app.all("*", (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server`, 404)); //404 -> Page not found
});

//Express error handler
app.use(errorHandler);

module.exports = app;
