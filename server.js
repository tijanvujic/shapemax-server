const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 8080;

// -------- Middleware --------
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "shapemax-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// -------- Database Setup --------
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected!");
});

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.send("ShapeMax server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// -------- Register API --------
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.json({ success: false, message: "Email already exists." });
        }
        return res.json({ success: false, message: "Registration failed." });
      }
      res.json({ success: true, message: "Registration successful!" });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// -------- Login API --------
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Please fill in all fields." });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Store user session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      goal: user.goal,
      is_admin: user.is_admin,
    };

    res.json({ success: true, message: "Login successful!" });
  });
});

// -------- Auth Check --------
app.get("/api/user", (req, res) => {
  if (req.session.user) {
    const userId = req.session.user.id;
    const sql = "SELECT * FROM users WHERE id = ?";
    db.query(sql, [userId], (err, results) => {
      if (err || results.length === 0) {
        return res.json({ loggedIn: false });
      }
      res.json({ loggedIn: true, user: results[0] });
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// -------- Logout --------
app.get("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

// -------- Update Profile --------
app.post("/api/update-profile", (req, res) => {
  const { name, password } = req.body;
  const user = req.session.user;

  if (!user) return res.json({ success: false, message: "Not logged in." });

  const sql = password
    ? "UPDATE users SET name = ?, password = ? WHERE id = ?"
    : "UPDATE users SET name = ? WHERE id = ?";

  const values = password
    ? [name, bcrypt.hashSync(password, 10), user.id]
    : [name, user.id];

  db.query(sql, values, (err) => {
    if (err) return res.json({ success: false, message: "Update failed." });
    req.session.user.name = name; // update session name
    res.json({ success: true, message: "Profile updated successfully." });
  });
});

// -------- Set Goal --------

app.post("/api/set-goal", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Not logged in" });

  const { goal } = req.body;
  const sql = "UPDATE users SET goal = ? WHERE id = ?";

  db.query(sql, [goal, req.session.user.id], (err) => {
    if (err) return res.status(500).json({ message: "Failed to save goal" });
    req.session.user.goal = goal;
    res.json({ success: true, message: "Goal saved successfully!" });
  });
});

//-------- Foods --------
app.get("/api/foods", (req, res) => {
  const sql = "SELECT * FROM foods";
  db.query(sql, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch foods." });
    res.json(results);
  });
});

//----------Save Meal--------
app.post("/api/save-meal", (req, res) => {
  const user = req.session.user;
  if (!user)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const { food_name, grams, calories, protein, carbs, fats } = req.body;

  const sql = `
    INSERT INTO user_meals (user_id, food_name, grams, calories, protein, carbs, fats)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [user.id, food_name, grams, calories, protein, carbs, fats],
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Failed to save meal" });
      res.json({ success: true });
    }
  );
});

app.get("/api/saved-meals", (req, res) => {
  const user = req.session.user;
  if (!user)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const sql = `
    SELECT * FROM user_meals
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [user.id], (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Error loading meals" });
    }

    res.json({ success: true, meals: results });
  });
});

//----------Calandar----------
app.get("/api/meals-by-date", (req, res) => {
  const user = req.session.user;
  const selectedDate = req.query.date;

  if (!user)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const sql = `
    SELECT food_name, grams, calories, protein, carbs, fats
    FROM user_meals
    WHERE user_id = ? AND DATE(created_at) = ?
  `;

  db.query(sql, [user.id, selectedDate], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    let totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    results.forEach((m) => {
      totals.calories += m.calories;
      totals.protein += m.protein;
      totals.carbs += m.carbs;
      totals.fats += m.fats;
    });

    res.json({ success: true, meals: results, totals });
  });
});

// ----- Delete Meal ---------
app.delete("/api/delete-meal/:id", (req, res) => {
  const mealId = req.params.id;

  const selectSql = "SELECT * FROM user_meals WHERE id = ?";
  db.query(selectSql, [mealId], (err, result) => {
    if (err || result.length === 0) {
      return res.json({ success: false, message: "Meal not found." });
    }

    const meal = result[0];

    const deleteSql = "DELETE FROM user_meals WHERE id = ?";
    db.query(deleteSql, [mealId], (deleteErr) => {
      if (deleteErr) {
        return res.json({ success: false, message: "Delete failed." });
      }

      res.json({ success: true, deletedMeal: meal });
    });
  });
});

app.get("/api/products", (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Database error." });
    res.json({ success: true, products: results });
  });
});

// -------- Start Server --------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//-------- Macros and calories for plan
app.post("/api/save-macro-goals", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const { calories, protein, carbs, fats, goal } = req.body;
  const sql = `
    INSERT INTO macro_goals (user_id, calories, protein, carbs, fats, goal)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [req.session.user.id, calories, protein, carbs, fats, goal],
    (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to save macro goals" });
      }
      res.json({ success: true, message: "Macro goals saved" });
    }
  );
});

app.get("/api/user/latest-macro-goal", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const sql = `
    SELECT calories, protein, carbs, fats
    FROM macro_goals
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;

  db.query(sql, [req.session.user.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    res.json({ success: true, latest: results[0] || null });
  });
});

//-------Admin suggested foods-------

app.post("/api/update-suggested", (req, res) => {
  const { id, suggested } = req.body;
  const sql = "UPDATE foods SET suggested = ? WHERE id = ?";
  db.query(sql, [suggested ? 1 : 0, id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

app.get("/admin-foods.html", (req, res, next) => {
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).send("Forbidden");
  }
  next();
});

//---------Admin add foods ------------

const uploadDir = path.join(__dirname, "public", "uploads");

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + unique + ext);
  },
});

const upload = multer({ storage });
app.post("/api/admin/add-food", upload.single("image"), (req, res) => {
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const {
    name,
    amount,
    protein,
    fats,
    carbs,
    calories,
    goalTag,
    category,
    suggested,
  } = req.body;
  const imagePath = req.file ? "/uploads/" + req.file.filename : "";

  const sql = `
    INSERT INTO foods (name, amount, protein, fats, carbs, calories, image, goalTag, category, suggested)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      amount,
      protein,
      fats,
      carbs,
      calories,
      imagePath,
      goalTag,
      category,
      suggested === "true" ? 1 : 0,
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Database insert failed" });
      }
      res.json({ success: true });
    }
  );
});

//------------Edit food-----------

app.post("/api/admin/edit-food/:id", upload.single("image"), (req, res) => {
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const id = req.params.id;
  const {
    name,
    amount,
    protein,
    fats,
    carbs,
    calories,
    goalTag,
    category,
    suggested,
  } = req.body;

  const imagePath = req.file ? "/uploads/" + req.file.filename : null;

  const fields = [
    "name = ?",
    "amount = ?",
    "protein = ?",
    "fats = ?",
    "carbs = ?",
    "calories = ?",
    "goalTag = ?",
    "category = ?",
    "suggested = ?",
  ];
  const values = [
    name,
    amount,
    protein,
    fats,
    carbs,
    calories,
    goalTag,
    category,
    suggested === "true" ? 1 : 0,
  ];

  if (imagePath) {
    fields.splice(6, 0, "image = ?"); // insert before goalTag
    values.splice(6, 0, imagePath);
  }

  const sql = `UPDATE foods SET ${fields.join(", ")} WHERE id = ?`;
  values.push(id);

  db.query(sql, values, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Update failed" });
    }
    res.json({ success: true });
  });
});
