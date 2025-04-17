// Smooth scroll and center the target section vertically when a navigation link is clicked
document.querySelectorAll(".nav-nutrition a").forEach((anchor) => {
  //navigation links
  anchor.addEventListener("click", function (event) {
    event.preventDefault();

    const targetId = this.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      // Calculate vertical position of the section from the top of the document
      const windowHeight = window.innerHeight;
      const sectionHeight = targetSection.offsetHeight;

      // Scroll to center the section in the viewport smoothly
      window.scrollTo({
        top: offset - windowHeight / 2 + sectionHeight / 2,
        behavior: "smooth",
      });
    }
  });
});
