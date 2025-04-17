// This script fetches saved meals from the backend
// Groups meals by date, displays them with totals

// Fetch meals from the server and display them grouped by date
async function fetchMeals() {
  const res = await fetch("/api/saved-meals");
  const data = await res.json();

  if (!data.success) {
    document.getElementById("meals-container").textContent =
      "Unable to load saved meals.";
    return;
  }

  // Group meals by date for display

  const mealsByDate = {};

  data.meals.forEach((meal) => {
    const date = new Date(meal.created_at).toLocaleDateString();
    if (!mealsByDate[date]) mealsByDate[date] = [];
    mealsByDate[date].push(meal);
  });

  const container = document.getElementById("meals-container");
  container.innerHTML = "";

  // For each date group, create a section in the UI
  Object.entries(mealsByDate).forEach(([date, meals]) => {
    const section = document.createElement("section");
    section.className = "meal-day";

    const heading = document.createElement("h3");
    heading.textContent = date;
    section.appendChild(heading);

    let totalCals = 0,
      totalP = 0,
      totalC = 0,
      totalF = 0;

    const list = document.createElement("div");
    list.className = "meal-list";

    // Loop through each meal to display and sum totals
    meals.forEach((m) => {
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
        `;
      list.appendChild(card);
    });

    // Create a paragraph to show the total calories/macros for the day
    const totals = document.createElement("p");
    totals.className = "meal-totals";
    totals.innerHTML = `<strong>Total:</strong> ${totalCals} kcal | ${totalP.toFixed(
      1
    )}g Protein | ${totalC.toFixed(1)}g Carbs | ${totalF.toFixed(1)}g Fats`;

    section.appendChild(list);
    section.appendChild(totals);
    container.appendChild(section);
  });
}

fetchMeals();
