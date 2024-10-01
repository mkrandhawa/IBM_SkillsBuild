/* easlint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  console.log("I am in login.js");
  try {
    console.log("i am inside catch");
    const res = await axios({
      method: "POST",
      // url: "/v1/users/login",
      url: "https://ibm-skillsbuild-1e9e8a9b5e74.herokuapp.com/v1/users/login",
      data: {
        email,
        password,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully");
      const userRole = res.data.data.user.role;
      const dashboardPath =
        userRole === "admin" ? "/admin-dashboard" : "/dashboard"; //get the correct dashboard based on the user role
      window.setTimeout(() => {
        location.assign(dashboardPath);
      }, 1500);
    }
  } catch (err) {
    showAlert("error", "Incorrect email or password!");
  }
};

//LOGGING OUT THE USER
export const logout = async () => {
  console.log("Logout button clicked"); // Add this log
  try {
    console.log("Before axios request"); // Add this log
    const res = await axios({
      method: "GET",
      url: "https://ibm-skillsbuild-1e9e8a9b5e74.herokuapp.com/v1/users/logout",
    });
    console.log("After axios request"); // Add this log
    if (res.data.status === "success") {
      console.log("Logout success"); // Add this log
      window.setTimeout(() => {
        location.assign("/");
      }, 1200);
    }
  } catch (err) {
    showAlert("error", "Error logging out! Try again.");
  }
};

export const reviews = async (review, rating, courseId) => {
  console.log("I am in review.js");
  try {
    console.log("i am inside catch");
    const res = await axios({
      method: "POST",
      url: `https://ibm-skillsbuild-1e9e8a9b5e74.herokuapp.com/v1/reviews/${courseId}`,
      data: {
        review,
        rating,
        courseId,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "Thanks for your review");
      window.setTimeout(() => {
        location.assign("/dashboard");
      }, 1000); //take 1.5 sec to load the home page
    }
  } catch (err) {
    showAlert("error", "You cannot review a course twice!");
    window.setTimeout(() => {
      location.assign("/dashboard");
    }, 1000); //take 1.5 sec to load the home page
  }
};

// START COURSE
export const start = async (courseId) => {
  console.log("hello start from login");
  console.log(courseId);

  const res = await axios({
    method: "POST",
    url: `https://ibm-skillsbuild-1e9e8a9b5e74.herokuapp.com/v1/courses/start/${courseId}`,
    data: {
      courseId,
    },
  });
};

// FINISH COURSE
export const complete = async (courseId) => {
  console.log("hello finish");

  try {
    console.log("i am inside course catch");
    const res = await axios({
      method: "PATCH",
      url: `https://ibm-skillsbuild-1e9e8a9b5e74.herokuapp.com/v1/courses/complete/${courseId}`,
      data: {
        courseId,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "You have completed your course");
      window.setTimeout(() => {
        location.assign("/dashboard");
      }, 1500); //take 1.5 sec to load the home page
    }
  } catch (err) {
    console.log(err);
    // window.setTimeout(() => {
    //   location.assign("/dashboard");
    // }, 1500); //take 1.5 sec to load the home page
  }
};
