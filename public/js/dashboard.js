// Fetch current user data from the server and display it on the dashboard
async function getUser() {
  const res = await fetch("/api/user");
  const data = await res.json();

  if (!data.loggedIn) {
    window.location.href = "/login.html";
  } else {
    document.getElementById(
      "welcome-msg"
    ).innerHTML = `Hello, <strong>${data.user.name}</strong> 👋<br>Email: ${data.user.email}`;
  }
}

// Log the user out and redirect to login page
function logout() {
  fetch("/api/logout").then(() => (location.href = "/login.html"));
}

getUser();

// Load user's profile name into the form
async function loadUser() {
  const res = await fetch("/api/user");
  const data = await res.json();
  if (!data.loggedIn) return (window.location.href = "/login.html");

  document.getElementById("name").value = data.user.name;
}

// Handle profile form submission to update user's name and optional password
document
  .getElementById("profile-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const res = await fetch("/api/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.value,
        password: form.password.value,
      }),
    });

    const result = await res.json();
    document.getElementById("profile-msg").textContent = result.message;
  });

// Handle fitness goal selection form submission to update user goal
document.getElementById("goal-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const res = await fetch("/api/set-goal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal: form.goal.value }),
  });
  const data = await res.json();
  showMessage("goal-msg", data.message);
});

loadUser();
