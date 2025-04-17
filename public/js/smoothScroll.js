// This script shows a 'scroll to top' button when the user scrolls down the page
const topButton = document.getElementById("scrollTopBtn");

// Check scroll position
window.onscroll = function () {
  if (
    document.body.scrollTop > 300 ||
    document.documentElement.scrollTop > 300
  ) {
    topButton.style.display = "block"; // Show
  } else {
    topButton.style.display = "none"; // Hide
  }
};
