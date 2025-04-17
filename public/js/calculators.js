//--------------- BMI Calculator Section ---------------
// Calculates Body Mass Index (BMI) using user input.
// Displays the BMI result, category, and progress indicator.

const calculateButton = document.getElementById("calculateButton");
const resetButton = document.getElementById("resetButton");

const weightInput = document.getElementById("weightInput");
const heightInput = document.getElementById("heightInput");

const resultBmiScore = document.getElementById("resultBmiScore");
const resultBmiCategory = document.getElementById("resultBmiCategory");
const bmiIndicator = document.getElementById("bmiIndicator");

calculateButton.addEventListener("click", () => {
  calculateBmiScore();
});

resetButton.addEventListener("click", () => {
  reset();
});

// Calculates BMI and updates the result on the screen
function calculateBmiScore() {
  const weight = parseFloat(weightInput.value);
  const height = parseFloat(heightInput.value) / 100;

  if (weight > 0 && height > 0) {
    const bmiScore = (weight / (height * height)).toFixed(1);
    resultBmiScore.textContent = bmiScore;
    showResultBmiCategory(bmiScore);
    showBmiIndicator(bmiScore);
  } else {
    alert("Please enter a valid height and weight!");
  }
}

// Displays BMI category (Underweight, Normal, etc.) based on score
function showResultBmiCategory(bmiScore) {
  if (bmiScore < 18.5) {
    resultBmiScore.style.color = "#0000FF";
    resultBmiCategory.textContent = "Underweight";
  } else if (bmiScore >= 18.5 && bmiScore <= 24.9) {
    resultBmiScore.style.color = "#008000";
    resultBmiCategory.textContent = "Normal";
  } else if (bmiScore >= 25 && bmiScore <= 29.9) {
    resultBmiScore.style.color = "#ffa500";
    resultBmiCategory.textContent = "Overweight";
  } else {
    resultBmiScore.style.color = "#ff0000";
    resultBmiCategory.textContent = "Obese";
  }
}

// Adjusts progress bar position to reflect the BMI category
function showBmiIndicator(bmiScore) {
  let firstScoreRange, lastScoreRange;
  let firstPercentRange, lastPercentRange;

  if (bmiScore < 18.5) {
    firstScoreRange = 0;
    lastScoreRange = 18.49;
    firstPercentRange = 0;
    lastPercentRange = 25;
  } else if (bmiScore >= 18.5 && bmiScore <= 24.9) {
    firstScoreRange = 18.5;
    lastScoreRange = 24.9;
    firstPercentRange = 25;
    lastPercentRange = 50;
  } else if (bmiScore >= 25 && bmiScore <= 29.9) {
    firstScoreRange = 25;
    lastScoreRange = 29.9;
    firstPercentRange = 50;
    lastPercentRange = 75;
  } else {
    firstScoreRange = 30;
    lastScoreRange = 50;
    firstPercentRange = 75;
    lastPercentRange = 100;
  }

  const range =
    (lastPercentRange - firstPercentRange) / (lastScoreRange - firstScoreRange);
  const stop = firstPercentRange - range * firstScoreRange;
  const percentage = Math.min(range * bmiScore + stop, 100);
  bmiIndicator.style.left = percentage + "%";
}

// Resets all BMI-related inputs and outputs to initial state
function reset() {
  weightInput.value = "";
  heightInput.value = "";
  resultBmiScore.textContent = "0";
  resultBmiScore.style.color = "#000";
  resultBmiCategory.textContent = "N/A";
  bmiIndicator.style.left = "0%";
}

//--------------- Calorie Calculator Section ---------------
// Estimates daily calorie needs based on BMR and activity level.

const calorieForm = document.getElementById("calorie-form");
const calorieResult = document.getElementById("calorie-result");

calorieForm.addEventListener("submit", function (event) {
  event.preventDefault();
  calculateCalories();
});

function calculateCalories() {
  const age = parseInt(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const activityLevel = parseFloat(document.getElementById("activity").value);

  if (isNaN(age) || age <= 0) {
    alert("Please enter a valid age!");
    return;
  }

  let bmr;
  if (gender === "male") {
    bmr = 88.36 + 13.4 * 70 + 4.8 * 175 - 5.7 * age;
  } else {
    bmr = 447.6 + 9.2 * 60 + 3.1 * 165 - 4.3 * age;
  }

  const dailyCalories = (bmr * activityLevel).toFixed(1);
  calorieResult.innerHTML = `<h3>Daily Caloric Needs: ${dailyCalories} kcal</h3>`;
}

//--------------- Body Fat Calculator Section ---------------
// Approximates body fat percentage using BMI-based formulas.

const bodyFatForm = document.getElementById("bodyfat-form");
const bodyFatResult = document.getElementById("bodyfat-result");

bodyFatForm.addEventListener("submit", function (event) {
  event.preventDefault();
  calculateBodyFat();
});

function calculateBodyFat() {
  const gender = document.getElementById("bodyfat-gender").value;
  const age = parseInt(document.getElementById("bodyfat-age").value);
  const height = parseFloat(document.getElementById("bodyfat-height").value);
  const weight = parseFloat(document.getElementById("bodyfat-weight").value);

  if (
    isNaN(age) ||
    age <= 0 ||
    isNaN(height) ||
    height <= 0 ||
    isNaN(weight) ||
    weight <= 0
  ) {
    alert("Please enter valid values for all fields!");
    return;
  }

  let bodyFatPercentage;

  if (gender === "male") {
    bodyFatPercentage =
      1.2 * (weight / (height / 100) ** 2) + 0.23 * age - 16.2;
  } else {
    bodyFatPercentage = 1.2 * (weight / (height / 100) ** 2) + 0.23 * age - 5.4;
  }

  bodyFatPercentage = bodyFatPercentage.toFixed(1);

  if (
    isNaN(bodyFatPercentage) ||
    bodyFatPercentage < 0 ||
    bodyFatPercentage > 60
  ) {
    bodyFatResult.innerHTML = `<h3 style='color:red;'>Error in calculation. Please check your inputs.</h3>`;
  } else {
    bodyFatResult.innerHTML = `<h3>Estimated Body Fat: ${bodyFatPercentage}%</h3>`;
  }
}

//--------------- Macronutrient Calculator Section ---------------
// Calculates daily macros (protein, fats, carbs) based on calorie goal.

const macroForm = document.getElementById("macro-form");
const macroResult = document.getElementById("macro-result");

macroForm.addEventListener("submit", function (event) {
  event.preventDefault();
  calculateMacros();
});

function calculateMacros() {
  const age = parseInt(document.getElementById("macro-age").value);
  const gender = document.getElementById("macro-gender").value;
  const height = parseFloat(document.getElementById("macro-height").value);
  const weight = parseFloat(document.getElementById("macro-weight").value);
  const activityLevel = parseFloat(
    document.getElementById("macro-activity").value
  );
  const goal = document.getElementById("macro-goal").value;

  if (isNaN(age) || isNaN(height) || isNaN(weight) || isNaN(activityLevel)) {
    alert("Please enter valid values for all fields!");
    return;
  }

  let bmr;
  if (gender === "male") {
    bmr = 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age;
  } else {
    bmr = 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age;
  }

  const tdee = bmr * activityLevel;

  let calorieIntake;
  switch (goal) {
    case "extreme-weight-loss":
      calorieIntake = tdee - 750;
      break;
    case "weight-loss":
      calorieIntake = tdee - 500;
      break;
    case "mild-weight-loss":
      calorieIntake = tdee - 250;
      break;
    case "maintain-weight":
      calorieIntake = tdee;
      break;
    case "mild-weight-gain":
      calorieIntake = tdee + 250;
      break;
    case "weight-gain":
      calorieIntake = tdee + 500;
      break;
    case "extreme-weight-gain":
      calorieIntake = tdee + 750;
      break;
    default:
      calorieIntake = tdee;
  }

  const protein = (calorieIntake * 0.3) / 4;
  const fats = (calorieIntake * 0.25) / 9;
  const carbs = (calorieIntake * 0.45) / 4;

  localStorage.setItem("macroCalories", Math.round(calorieIntake));
  localStorage.setItem("macroProtein", Math.round(protein));
  localStorage.setItem("macroFats", Math.round(fats));
  localStorage.setItem("macroCarbs", Math.round(carbs));

  macroResult.innerHTML = `
    <h3>Daily Macronutrient Breakdown:</h3>
    <p>Calories: ${calorieIntake.toFixed(0)} kcal</p>
    <p>Protein: ${protein.toFixed(1)} g</p>
    <p>Fats: ${fats.toFixed(1)} g</p>
    <p>Carbohydrates: ${carbs.toFixed(1)} g</p>
  `;

  // Sends the calculated macro goals to the Data base

  fetch("/api/save-macro-goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      calories: Math.round(calorieIntake),
      protein: parseFloat(protein.toFixed(1)),
      carbs: parseFloat(carbs.toFixed(1)),
      fats: parseFloat(fats.toFixed(1)),
      goal: goal,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        console.log("Macro goal saved successfully");
      } else {
        console.error("Failed to save macro goal");
      }
    })
    .catch((err) => {
      console.error("Error saving macro goal:", err);
    });
}

//--------------- Tab Navigation Logic ---------------
// Enables switching between different calculators using the nav menu.

document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".calculator-nav ul li a");
  const calculators = document.querySelectorAll(".calculator-section");

  function showCalculator(targetId) {
    calculators.forEach((calc) => {
      calc.classList.remove("active");
    });

    document.getElementById(targetId).classList.add("active");

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href").substring(1) === targetId) {
        link.classList.add("active");
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      showCalculator(targetId);
    });
  });

  // Show the first calculator by default
  if (calculators.length > 0) {
    showCalculator(calculators[0].id);
  }
});
