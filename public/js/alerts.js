/* easlint-disable */

export const hideAlert = () => {
  const el = document.querySelector(".alert");
  //move up to the parent and remove the child
  if (el) el.parentElement.removeChild(el);
};

//TYPE: success or error
export const showAlert = (type, message) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}"}>${message}</div>`;
  //inside of the body right at the beginning
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup); //element where we want to include the html that we have created
  window.setTimeout(hideAlert, 3000);
};
