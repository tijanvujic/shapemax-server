// Handles contact form submission using EmailJS
// Displays success or error message after form submission
const form = document.getElementById("contact-form");
const msg = document.getElementById("form-msg");

// Prevent default form behavior and trigger email send
form.addEventListener("submit", function (e) {
  e.preventDefault();

  emailjs
    .sendForm("service_b5bhhyj", "template_elcot6s", form)
    // If successfull
    .then(() => {
      msg.textContent = "✅ Message sent successfully!";
      msg.style.color = "green";
      msg.classList.add("show");
      form.reset();
    })
    // If error: show an error message
    .catch((error) => {
      msg.textContent = "❌ Failed to send. Please try again.";
      msg.style.color = "red";
      msg.classList.add("show");
      console.error("EmailJS error:", error);
    });
});
