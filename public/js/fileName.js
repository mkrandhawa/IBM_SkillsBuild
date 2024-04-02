document.getElementById("photo").addEventListener("change", function () {
  var fileName = this.files[0].name;
  document.getElementById("file_name").textContent = fileName;
});
