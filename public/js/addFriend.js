import axios from "axios";
import { showAlert } from "./alerts";

// Function to add a friend
export const addFriend = async (friendId) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `https://ibm-skillsbuild-1e9e8a9b5e74.herokuapp.com/v1/users/addFriend/${friendId}`,
    });
    console.log(res);
    console.log(" i am above if");
    if (res.data.status === "success") {
      showAlert("success", "Friend added successfully");
      console.log("i am in if");
      window.setTimeout(() => {
        location.assign("/user/friends");
      }, 5000);
    }
  } catch (err) {
    console.error("Error adding friend:", err);
    showAlert("error", "Error adding friend: " + err.message);
  }
};
