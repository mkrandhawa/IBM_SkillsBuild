/* easlint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

//tyoe is either password or data
export const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "/v1/users/updateMe",
      data,
    });
    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated successfully`);
      window.setTimeout(() => {
        location.assign("/account/uploadPhoto");
      }, 500);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", "This is not an image file.");
  }
};
