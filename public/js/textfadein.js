document.addEventListener("DOMContentLoaded", function () {
  const fadeElements = document.querySelectorAll(".text-fade");

  function checkVisibility() {
    fadeElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        el.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", checkVisibility);
  checkVisibility(); // Run on page load
});
