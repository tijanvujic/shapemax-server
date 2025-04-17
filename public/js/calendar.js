// Format a date string into a human-readable format (e.g., January 1, 2024)
function formatDate(dateStr) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

// Load and display meals logged for a specific date
// Also handles calculating totals and rendering the UI
function loadMealsForDate(date) {
  fetch(`/api/saved-meals?date=${date}`)
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("calendar-container");
      container.innerHTML = "";

      if (!data.success || !data.meals.length) {
        container.textContent = "No meals logged for this date.";
        return;
      }

      let totalCals = 0,
        totalP = 0,
        totalC = 0,
        totalF = 0;

      const heading = document.createElement("h3");
      heading.textContent = formatDate(date);
      container.appendChild(heading);

      const mealList = document.createElement("div");
      mealList.className = "meal-list";

      data.meals.forEach((m) => {
        const mealDate = new Date(m.created_at).toISOString().split("T")[0];
        if (mealDate !== date) return; // Skip meals not matching selected date

        totalCals += m.calories;
        totalP += m.protein;
        totalC += m.carbs;
        totalF += m.fats;

        const card = document.createElement("div");
        card.className = "meal-card";
        card.innerHTML = `
          <strong>${m.food_name}</strong><br>
          ${m.grams}g - ${m.calories} kcal<br>
          P: ${m.protein}g | C: ${m.carbs}g | F: ${m.fats}g
          <button class="delete-meal" data-id="${m.id}">🗑 Delete</button>
        `;
        mealList.appendChild(card);
      });

      const totals = document.createElement("p");
      totals.className = "meal-totals";
      totals.innerHTML = `<strong>Total:</strong> ${totalCals} kcal | ${totalP.toFixed(
        1
      )}g P | ${totalC.toFixed(1)}g C | ${totalF.toFixed(1)}g F`;

      container.appendChild(mealList);
      container.appendChild(totals);

      // Setup click handlers for delete buttons to remove meals
      document.querySelectorAll(".delete-meal").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          fetch(`/api/delete-meal/${id}`, { method: "DELETE" })
            .then((res) => res.json())
            .then((result) => {
              if (result.success) loadMealsForDate(date);
            });
        });
      });
    });
}

// Initialize calendar behavior on page load
// Handles date selection, navigation, and meal fetching
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("calendar-date");
  const urlParams = new URLSearchParams(window.location.search);
  const today = new Date().toLocaleDateString("en-CA"); // Ensures local date format YYYY-MM-DD

  const selectedDate = urlParams.get("date") || today;
  dateInput.value = selectedDate;

  dateInput.addEventListener("change", () => {
    const newDate = dateInput.value;
    window.history.replaceState(null, "", `?date=${newDate}`);
    loadMealsForDate(newDate);
  });

  document.getElementById("go-today").addEventListener("click", () => {
    dateInput.value = today;
    window.history.replaceState(null, "", `?date=${today}`);
    loadMealsForDate(today);
  });

  loadMealsForDate(selectedDate);
});
