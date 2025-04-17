const form = document.getElementById("food-form");

const loadFoods = () => {
  fetch("/api/foods")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector("#food-table tbody");
      tbody.innerHTML = "";
      data.forEach((food) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><img src="${food.image}" alt="${food.name}" /></td>
          <td>${food.name}</td>
          <td>${food.protein}</td>
          <td>${food.fats}</td>
          <td>${food.carbs}</td>
          <td>${food.calories}</td>
          <td><input type="checkbox" class="suggested-toggle" data-id="${
            food.id
          }" ${food.suggested ? "checked" : ""}></td>
          <td><button class="edit-btn" data-id="${food.id}">Edit</button></td>
        `;
        tbody.appendChild(row);
      });

      document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          const food = data.find((f) => f.id == id);
          form.id.value = food.id;
          form.name.value = food.name;
          form.amount.value = food.amount;
          form.protein.value = food.protein;
          form.fats.value = food.fats;
          form.carbs.value = food.carbs;
          form.calories.value = food.calories;
          form.goalTag.value = food.goalTag || "";
          form.categories.value = food.categories || "";
          form.suggested.checked = food.suggested ? true : false;
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });

      document.querySelectorAll(".suggested-toggle").forEach((toggle) => {
        toggle.addEventListener("change", (e) => {
          const id = e.target.getAttribute("data-id");
          const suggested = e.target.checked;
          fetch("/api/update-suggested", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, suggested }),
          });
        });
      });
    });
};

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  formData.set("suggested", form.suggested.checked);

  const endpoint = form.id.value
    ? "/api/admin/edit-food/" + form.id.value
    : "/api/admin/add-food";

  fetch(endpoint, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((response) => {
      if (response.success) {
        alert(form.id.value ? "Food updated!" : "Food added!");
        form.reset();
        form.id.value = "";
        loadFoods();
      } else {
        alert("Error: " + response.message);
      }
    });
});

window.addEventListener("DOMContentLoaded", loadFoods);
