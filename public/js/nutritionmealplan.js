// Array to store all food items fetched from the database
let allFoods = [];

// Calculate calories and macros (protein, carbs, fats) based on grams input
function calculateCalories(food, grams) {
  const factor = grams / food.amount;
  return {
    calories: Math.round(food.calories * factor),
    protein: Math.round(food.protein * factor * 10) / 10,
    fats: Math.round(food.fats * factor * 10) / 10,
    carbs: Math.round(food.carbs * factor * 10) / 10,
  };
}

// Check if it's a new day and reset tracker values in localStorage if needed
const today = new Date().toISOString().split("T")[0];
const lastTrackedDate = localStorage.getItem("lastTrackedDate");

if (lastTrackedDate !== today) {
  ["calories", "protein", "carbs", "fats"].forEach((key) => {
    localStorage.setItem(`${key}Consumed`, 0);
  });
  localStorage.setItem("lastTrackedDate", today);
}

// Update the UI and localStorage tracker with new meal data
function updateTracker(mealData) {
  const keys = ["calories", "protein", "carbs", "fats"];
  keys.forEach((key) => {
    const prev = parseInt(localStorage.getItem(`${key}Consumed`)) || 0;
    const current = prev + mealData[key];
    localStorage.setItem(`${key}Consumed`, current);
    document.getElementById(`${key}-tracker`).textContent = current;
    document.getElementById(`${key}-progress`).value = current;
  });
}

// Display a temporary toast notification on the screen
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Create a visual card for each food item and attach add-to-tracker functionality
function createFoodCard(food) {
  const card = document.createElement("div");
  card.className = "food-card";
  card.setAttribute("data-name", food.name);

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "×";
  removeBtn.className = "remove-btn";
  removeBtn.onclick = () => card.remove();

  const img = document.createElement("img");
  img.src = food.image;
  img.alt = food.name;

  const name = document.createElement("h4");
  name.textContent = food.name;

  const info = document.createElement("p");
  const mealData = calculateCalories(food, food.amount);
  info.innerHTML = `
    <strong>${mealData.calories}</strong> kcal<br>
    <strong>${mealData.protein}</strong>g protein<br>
    <strong>${mealData.carbs}</strong>g carbs<br>
    <strong>${mealData.fats}</strong>g fats
  `;

  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.value = food.amount;
  amountInput.className = "amount-input";

  const unit = document.createElement("span");
  unit.textContent = "g";
  unit.className = "unit-label";

  const amountContainer = document.createElement("div");
  amountContainer.className = "amount-wrapper";
  amountContainer.append(amountInput, unit);

  // Update card display when amount input changes
  amountInput.addEventListener("input", () => {
    const grams = parseInt(amountInput.value) || food.amount;
    const updated = calculateCalories(food, grams);
    info.innerHTML = `
      <strong>${updated.calories}</strong> kcal<br>
      <strong>${updated.protein}</strong>g protein<br>
      <strong>${updated.carbs}</strong>g carbs<br>
      <strong>${updated.fats}</strong>g fats
    `;
  });

  const btn = document.createElement("button");
  btn.textContent = "Add to Tracker";
  btn.className = "btn-add-meal";

  //  Save the meal to DB and update tracker
  btn.onclick = () => {
    const grams = parseInt(amountInput.value) || food.amount;
    const mealData = calculateCalories(food, grams);

    fetch("/api/save-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        food_name: food.name,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fats: mealData.fats,
        grams,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          updateTracker(mealData);
          showToast(`${food.name} added to tracker!`);
        } else {
          showToast("Failed to save meal.");
        }
      })
      .catch(() => showToast("Error saving meal."));
  };

  if (food.suggested) {
    const tag = document.createElement("div");
    tag.className = "suggested-tag";
    tag.innerHTML = `<i class="fas fa-star"></i> Suggested`;
    card.appendChild(tag);
  }

  card.append(removeBtn, img, name, info, amountContainer, btn);
  return card;
}

// Render all food cards onto the UI based on filtered or all items
function renderFoodList(foodsToShow) {
  const grid = document.getElementById("foods-grid");
  grid.innerHTML = "";
  foodsToShow.forEach((food) => grid.appendChild(createFoodCard(food)));
}

// Build the suggestion UI section with search and category filters
function setupSuggestionsSection() {
  const wrapper = document.createElement("div");
  wrapper.id = "suggested-foods";

  const heading = document.createElement("h3");
  heading.textContent = "Suggested Foods:";
  wrapper.appendChild(heading);

  const controls = document.createElement("div");
  controls.className = "controls";

  // 🔍 Search input to filter foods
  const searchInput = document.createElement("input");
  searchInput.className = "food-search";
  searchInput.placeholder = "Search foods...";
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filtered = allFoods.filter((food) =>
      food.name.toLowerCase().includes(query)
    );
    renderFoodList(filtered);
  });

  // Category filter buttons
  const filters = ["protein", "carb", "fat", "suggested"];
  filters.forEach((type) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    btn.onclick = () => {
      let filtered;
      if (type === "suggested") {
        filtered = allFoods.filter((f) => f.suggested);
      } else {
        filtered = allFoods.filter((f) =>
          (f.categories || f.category || "")
            .toLowerCase()
            .split(",")
            .includes(type)
        );
      }
      renderFoodList(filtered);
    };
    controls.appendChild(btn);
  });

  controls.appendChild(searchInput);
  wrapper.appendChild(controls);

  const grid = document.createElement("div");
  grid.className = "food-grid";
  grid.id = "foods-grid";

  wrapper.appendChild(grid);

  const calcSection = document.querySelector(".calculate-calories-container");
  if (calcSection) {
    calcSection.parentNode.insertBefore(wrapper, calcSection.nextSibling);
  }
}

// On page load, set up event listeners and initialize food data and UI
document.addEventListener("DOMContentLoaded", () => {
  const keys = ["calories", "protein", "carbs", "fats"];

  //  Load saved macro values into tracker
  keys.forEach((key) => {
    const saved = parseInt(localStorage.getItem(`${key}Consumed`)) || 0;
    document.getElementById(`${key}-tracker`).textContent = saved;
    document.getElementById(`${key}-progress`).value = saved;
  });

  //  Reset tracker on button click
  document.getElementById("reset-calories").addEventListener("click", () => {
    ["calories", "protein", "carbs", "fats"].forEach((key) => {
      localStorage.setItem(`${key}Consumed`, 0);
      document.getElementById(`${key}-tracker`).textContent = 0;
      document.getElementById(`${key}-progress`).value = 0;
    });
    localStorage.setItem(
      "lastTrackedDate",
      new Date().toISOString().split("T")[0]
    );
  });

  // Load user goal and move tracker into correct position
  fetch("/api/user")
    .then((res) => res.json())
    .then((userData) => {
      const sectionTitle = document.querySelector(".main-title");
      const goal = userData.user.goal || "custom";
      const goalText = {
        loss: "focused on weight loss",
        gain: "focused on muscle gain",
        maintain: "focused on weight maintenance",
        custom: "custom",
      };

      const goalMsg = document.createElement("p");
      goalMsg.textContent = `Your plan is ${goalText[goal]}`;
      goalMsg.style.fontWeight = "500";
      goalMsg.style.marginBottom = "10px";
      sectionTitle.insertAdjacentElement("afterend", goalMsg);

      const tracker = document.querySelector(".meal-tracker");
      const subnav = document.querySelector(".sub-navigation");
      if (subnav && tracker) {
        subnav.parentNode.insertBefore(tracker, subnav.nextSibling);
      }
    });

  //  Fetch food data from database and build suggestion cards
  fetch("/api/foods")
    .then((res) => res.json())
    .then((foods) => {
      allFoods = foods;
      setupSuggestionsSection();
      renderFoodList(allFoods);
    })
    .catch((err) => console.error("Error loading foods:", err));
});

document.addEventListener("DOMContentLoaded", function () {
  // Load the latest macro goal from the backend if available and update tracker limits
  fetch("/api/user/latest-macro-goal")
    .then((res) => res.json())
    .then((goalData) => {
      const macro = goalData.latest || {};

      const calories =
        macro.calories || localStorage.getItem("macroCalories") || 2500;
      const protein =
        macro.protein || localStorage.getItem("macroProtein") || 150;
      const carbs = macro.carbs || localStorage.getItem("macroCarbs") || 300;
      const fats = macro.fats || localStorage.getItem("macroFats") || 70;

      document.getElementById("max-calories").textContent = calories + " kcal";
      document.getElementById("max-protein").textContent = protein;
      document.getElementById("max-carbs").textContent = carbs;
      document.getElementById("max-fats").textContent = fats;

      document.getElementById("calories-progress").max = calories;
      document.getElementById("protein-progress").max = protein;
      document.getElementById("carbs-progress").max = carbs;
      document.getElementById("fats-progress").max = fats;
    })
    .catch((err) => {
      console.warn("Could not load macros from DB:", err);
    });
});
