const labels = document.querySelectorAll(".custom-sidebar .label");
const sidebarBtn = document.querySelector(".custom-sidebar .sidebar-btn");
const customSidebar = document.querySelector(".custom-sidebar");

labels.forEach((label, index) => {
  label.style.transitionDelay = `${index * 50}ms`;
});

sidebarBtn.addEventListener("click", () => {
  customSidebar.classList.toggle("active");
});
