/* easlint-disable */
//console.log('Hello from parcel ');
import "@babel/polyfill";
import { login, logout, reviews, complete, start } from "./login";
import { signup, enroll } from "./register";
import { updateSettings } from "./userAccount";
import { deleteReviews } from "./adminAccount";
import { addFriend } from "./addFriend";

//DOM ELEMENTS
console.log("i am in index");
const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const signupForm = document.querySelector(".form--signup");
const enrollMe = document.querySelector(".enroll__btn");
const reviewForm = document.querySelector(".review-form");
const finishCourse = document.querySelector(".finish");
const startCourse = document.querySelectorAll(".startCourse");
const uploadPhoto = document.querySelector(".form-user-data");
const deleteReview = document.querySelectorAll(".delete_btns");
const friend = document.querySelector(".addFriend");
const url = document.querySelector(".ibmLink");

/***************************  USER  ************************************** */
if (loginForm) {
  console.log("i am inside loginform");
  //the .form is the class that has been used in the loginForm.pug file
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault(); //prevent the form from loading any other elements on the page
    //VALUES
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  }); //quering on the form and the browser will fire off at 'submit' of the form
}

//LOGGING OUT THE USER
if (logoutBtn) logoutBtn.addEventListener("click", logout);

//REGISTERING THE USER
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password");
    const cpassword = document.getElementById("cpassword");

    // Create a message container
    let messageContainer = document.getElementById("message-container");
    if (!messageContainer) {
      messageContainer = document.createElement("div");
      messageContainer.id = "message-container";
      signupForm.appendChild(messageContainer);
    }

    // Check if passwords match
    if (password.value !== cpassword.value) {
      // Highlight fields in red
      password.style.borderColor = "red";
      cpassword.style.borderColor = "red";
      // Display a message to the user
      messageContainer.textContent =
        "Passwords do not match. Please try again.";
      messageContainer.style.color = "red";
    } else {
      // Remove the red border and clear previous messages
      password.style.borderColor = "";
      cpassword.style.borderColor = "";
      messageContainer.textContent = "";
      signup(name, email, password.value, cpassword.value);
    }
  });
}

//ENROLL USER INTO COURSE
if (enrollMe) {
  enrollMe.addEventListener("click", () => {
    const courseId = enrollButton.dataset.courseId;
    console.log(courseId); // Output: 5c88fa8cf4afda39709c2955
    enroll(courseId);
  });
}

// Event listener for the form submit
if (reviewForm) {
  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const review = document.getElementById("review").value;
    const selectedRating = document.querySelector(
      'input[name="rate"]:checked'
    ).value;
    const courseId = submit.dataset.courseId;
    reviews(review, selectedRating, courseId);
  });
}

//FINISH COURSE
if (finishCourse) {
  console.log("hello from finishcourse");
  finishCourse.addEventListener("click", () => {
    const courseId = finishCourse.dataset.courseId;
    console.log(courseId); // Output: 5c88fa8cf4afda39709c2955
    complete(courseId);
  });
}

//START COURSE
if (startCourse) {
  for (const btn of startCourse) {
    btn.addEventListener("click", () => {
      const courseId = btn.dataset.courseId;
      start(courseId);
    });
  }
}

//Upload/Update Profile Picture
if (uploadPhoto) {
  console.log(" i am in upload photo");
  uploadPhoto.addEventListener("submit", (e) => {
    e.preventDefault();
    // const photo = document.getElementById("photo").file[0];
    // updateSettings(photo);
    const form = new FormData();
    //append all the data to the form
    form.append("photo", document.getElementById("photo").files[0]);
    console.log(form);
    updateSettings(form, "photo");
  });
}
document.addEventListener("DOMContentLoaded", () => {
  // Select the button using a more specific selector if necessary
  const okButton = document.querySelector(".alertb .btn");

  // Check if the button exists to avoid null reference errors
  if (okButton) {
    okButton.addEventListener("click", function () {
      // Use 'this' to refer to the button that was clicked
      this.closest(".alertb").style.display = "none";
    });
  }
});

//Add friend
if (friend) {
  friend.addEventListener("click", () => {
    const userId = friend.dataset.userId;
    addFriend(userId);
  });
}

if (url) {
  url.addEventListener("click", () => {
    var win = window.open("https://skillsbuild.org/college-students", "_blank");
    win.focus();
  });
}

/***************************  ADMIN  ************************************** */

//Delete reviews
if (deleteReview) {
  for (const btn of deleteReview) {
    btn.addEventListener("click", () => {
      const reviewId = btn.dataset.reviewId;
      deleteReviews(reviewId);
    });
  }
}
