document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("footer");
  footer.innerHTML = `
  <link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
/>

    <footer class="main-footer">
      <div class="footer-container">
        <div class="footer-content">
          <p>&copy; ${new Date().getFullYear()} ShapeMax. All rights reserved.</p>
          <nav class="footer-links">
            <a href="index.html">Home</a>
            <a href="nutrition.html">Nutrition</a>
            <a href="store.html">Store</a>
            <a href="nutritionmealplan.html">Plan</a>
          </nav>
          <div class="footer-socials">
            <a href="https://instagram.com" title="Instagram" target="_blank">
                <i class="fab fa-instagram"></i>
            </a>
            <a href="https://youtube.com" title="YouTube" target="_blank">
                <i class="fab fa-youtube"></i>
            </a>
            <a href="https://www.tiktok.com/@tiyan.motiv8" title="TikTok" target="_blank">
                <i class="fab fa-tiktok"></i>
            </a>
            </div>
          <button class="back-to-top" onclick="window.scrollTo({top: 0, behavior: 'smooth'});">
            <i class="fas fa-arrow-up"></i> Back to Top
        </button>

        </div>
      </div>
    </footer>
  `;
});
