let cart = [];
let currentPage = 0;
const itemsPerPage = 8;
let allProducts = [];

function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast("🛒 Added to cart");
}

function renderProductsPage(products) {
  const container = document.getElementById("product-list");
  const start = currentPage * itemsPerPage;
  const end = start + itemsPerPage;
  const pageProducts = products.slice(start, end);

  pageProducts.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p class="description">${p.description}</p>
      <div class="product-footer">
        <span>$${parseFloat(p.price).toFixed(2)}</span>
        <button class="add-to-cart-btn">Add to Cart</button>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => addToCart(p));
    container.appendChild(card);
  });

  currentPage++;
}

async function fetchProducts() {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();

    if (data.success) {
      allProducts = data.products;
      renderProductsPage(allProducts);
    } else {
      document.getElementById("product-list").innerHTML =
        "<p>❌ Failed to load products.</p>";
    }
  } catch (error) {
    console.error("Fetch error:", error);
    document.getElementById("product-list").innerHTML =
      "<p>❌ Could not fetch products.</p>";
  }
}

function saveCart() {
  localStorage.setItem("shapemax_cart", JSON.stringify(cart));
}

function loadCart() {
  const stored = localStorage.getItem("shapemax_cart");
  if (stored) cart = JSON.parse(stored);
}

function renderCart() {
  const cartItems = document.querySelector(".cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");
  const cartBubble = document.getElementById("cart-bubble");

  cartItems.innerHTML = "";
  let total = 0;
  let qty = 0;

  cart.forEach((item) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-details">
        <p>${item.name}</p>
        <p>$${(item.price * item.qty).toFixed(2)} (${item.qty})</p>
      </div>
      <button class="remove-item" data-id="${item.id}">×</button>
    `;
    div.querySelector(".remove-item").addEventListener("click", () => {
      cart = cart.filter((p) => p.id !== item.id);
      saveCart();
      renderCart();
    });
    cartItems.appendChild(div);
    total += item.price * item.qty;
    qty += item.qty;
  });

  cartTotal.textContent = `$${total.toFixed(2)}`;
  cartCount.textContent = qty;
  cartBubble.textContent = qty;

  // Animate total
  cartTotal.classList.remove("pop");
  void cartTotal.offsetWidth;
  cartTotal.classList.add("pop");
}

function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function toggleCart() {
  document.querySelector(".cart-section").classList.toggle("visible");
}

function handleScrollPagination() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    renderProductsPage(allProducts);
  }
}

function handleCheckout() {
  if (cart.length === 0) {
    showToast("🛒 Your cart is empty!");
    return;
  }

  alert("Checkout coming soon!");
}

window.addEventListener("DOMContentLoaded", () => {
  loadCart();
  fetchProducts();
  renderCart();

  document.getElementById("cart-toggle").addEventListener("click", toggleCart);
  document
    .getElementById("checkout-btn")
    .addEventListener("click", handleCheckout);

  window.addEventListener("scroll", handleScrollPagination);
});

//--------------Animation for products-----------------

function animateVisibleCards() {
  const cards = document.querySelectorAll(".product-card:not(.visible)");
  const triggerBottom = window.innerHeight;

  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    if (rect.top < triggerBottom) {
      card.style.setProperty("--delay", `${index * 100}ms`);
      card.classList.add("visible");
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  animateVisibleCards();
  setTimeout(animateVisibleCards, 100);
});
window.addEventListener("scroll", animateVisibleCards);
