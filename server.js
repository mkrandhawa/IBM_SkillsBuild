const mongoose = require("mongoose");
const dotenv = require("dotenv");

const app = require("./app");

//Error handling for uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down ...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
//CONNECTING TO ATLAS DB
const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.error("DB connection error: ", err));

//Defining the port number
const port = process.env.PORT || 3000;

//Starting the sever
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//Error handling for unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLES REJECTION! Shutting down...");
  server.close(() => {
    process.exit(1); //aboring all pending requests/promises
  });
});
