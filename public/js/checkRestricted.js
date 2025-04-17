// This function checks if the user is logged in.
// If not, it redirects them to the login page.
async function checkAccess() {
  const res = await fetch("/api/user");
  const data = await res.json();
  if (!data.loggedIn) {
    window.location.href = "/login.html";
  }
}
checkAccess();
