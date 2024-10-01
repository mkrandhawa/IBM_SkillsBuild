/* easlint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const signup = async (name, email, password, cpassword) => {
  console.log("I am in register.js");
  try {
    console.log("i am inside catch");
    const res = await axios({
      method: "POST",
      url: "https://ibm-skillsbuild-1e9e8a9b5e74.herokuapp.com/v1/users/signup",
      data: {
        name,
        email,
        password,
        cpassword,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "Registration successful");
      window.setTimeout(() => {
        location.assign("/dashboard");
      }, 1500); //take 1.5 sec to load the home page
    }
  } catch (err) {
    console.log("i am err", err);
    showAlert("error", "Email already in use!");
  }
};

//ENROLLING THE USER
export const enroll = async (courseId) => {
  console.log("I am in register.js");
  try {
    console.log("i am inside catch");
    const res = await axios({
      method: "POST",
      url: `https://ibm-skillsbuild-1e9e8a9b5e74.herokuapp.com/v1/users/enrollMe/${courseId}`,
    });
    if (res.data.status === "success") {
      console.log("Enrollment completed");
      showAlert("success", "Enrollment completed");
      window.setTimeout(() => {
        location.assign("/dashboard");
      }, 1000); //take 1.5 sec to load the home page
    }
  } catch (err) {
    showAlert("error", "You are already enrolled!");
    window.setTimeout(() => {
      location.assign("/dashboard");
    }, 1000); //take 1.5 sec to load the home page
  }
};
