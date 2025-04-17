function toggleMenu() {
  const navigation = document.querySelector(".navigation");
  const menuToggle = document.querySelector(".menu-toggle");

  navigation.classList.toggle("active");
  menuToggle.classList.toggle("active");
}
