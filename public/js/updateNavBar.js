async function updateNavbar() {
  const res = await fetch("/api/user");
  const data = await res.json();

  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const greeting = document.getElementById("user-greeting");

  if (data.loggedIn) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    greeting.textContent = `${data.user.name}`;
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    greeting.textContent = "";
  }
}

document.getElementById("logout-btn").addEventListener("click", async () => {
  await fetch("/api/logout");
  location.reload();
});

updateNavbar();
