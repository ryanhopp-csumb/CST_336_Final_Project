import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import session from "express-session";
const app = express();

//middleware info & function
app.set("view engine", "ejs");
app.use(express.static("public"));
//for Express to get values using the POST method
app.use(express.urlencoded({ extended: true }));

//setting up sessions
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

//adding the middleware function used by all routes
app.use((req, res, next) => {
  res.locals.user_Name = req.session.user_Name || "";
  next();
});
function isUserAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect("/login");
  }
}

//setting up database connection pool, replace values in red
const pool = mysql.createPool({
  host: "hngomrlb3vfq3jcr.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "aa3dyc0mw8c8zb5t",
  password: "qd0qhbuo6ce2ccpz",
  database: "bao4zpfnzi38d977",
  connectionLimit: 10,
  waitForConnections: true,
});

let cart = [
  { title: "The Midnight Garden", author: "Sarah Mitchell", price: 24.99 },
  { title: "Echoes of the Past", author: "William Harrison", price: 19.99 },
];
//routes
app.get("/", async (req, res) => {
  let url =
    "https://www.googleapis.com/books/v1/volumes?q=SEARCH_TERM&key=AIzaSyBh_tUuyGb8X7GrGSwOty0IP3VVB_WCABo";
app.get('/', async(req, res) => {
   let url = 'https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=relevance&maxResults=10&key=AIzaSyBh_tUuyGb8X7GrGSwOty0IP3VVB_WCABo';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("There was an error accessing the API");
    }
    const data = await response.json();
    let homeData = data.items;
    res.render("home.ejs", { homeData });
  } catch (err) {
    if (err instanceof TypeError) {
      res.render("home.ejs", {
        message: "There was an error accessing the API (network failure)",
        homeData: [],
      });
    } else {
      res.render("Error", { message: "Couldn't load the books", homeData: [] });
    }
  }
});

app.get("/cart", isUserAuthenticated, (req, res) => {
  res.render("cart.ejs", { cart });
});

app.post("/cart/remove", isUserAuthenticated, (req, res) => {
  const { title } = req.body;
  cart = cart.filter((item) => item.title !== title);
  res.redirect("/cart");
});

// login page route
app.get("/login", (req, res) => {
  res.render("login.ejs", { error: false });
});

//login form info checking with databse
app.post("/loginForm", async (req, res) => {
  let { user_Name, password } = req.body;
  let sql = `SELECT *
              FROM users
              WHERE user_Name = ?`;
  const [rows] = await pool.query(sql, [user_Name]);
  if (rows.length === 0) {
    return res.render("login.ejs", { error: true });
  }
  const passMatch = await bcrypt.compare(password, rows[0].password_hashed);
  if (!passMatch) {
    return res.render("login.ejs", { error: true });
  }
  // starting the session if login is successful
  req.session.authenticated = true;
  req.session.user_Name = rows[0].user_Name;
  res.redirect("/loginSuccess");
});

// login success page route
app.get("/loginSuccess", (req, res) => {
  res.render("loginSuccess.ejs");
});

// signup success page route
app.get("/signupSuccess", (req, res) => {
  res.render("signupSuccess.ejs");
});

// signup page route
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

// adding the new profile info (from the signup form) to our database
app.post("/signupForm", async (req, res) => {
  let { first_Name, Last_Name, user_Name, password, email } = req.body;
  let password_hashed = await bcrypt.hash(password, 11); // hashes the password. 11 is for 2^11 operations a hacker would have to do to get the password. we can adjust from 10-12.
  let sql = `INSERT INTO users
               (first_Name, Last_Name, user_Name, email, password_hashed)
               VALUES (?, ?, ?, ?, ?)`;
  let sqlParams = [first_Name, Last_Name, user_Name, email, password_hashed];
  const [rows] = await pool.query(sql, sqlParams);
  //starting the session
  req.session.authenticated = true;
  req.session.user_Name = user_Name;
  res.redirect("/signupSuccess");
});
// checkout page route
app.get("/pay", isUserAuthenticated, (req, res) => {
  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  res.render("pay.ejs", { cart, total });
});

// Order Confirm page route
app.post("/place-order", (req, res) => {
  const { fullName, address, cardNumber, expiryDate, cvv } = req.body;

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  res.render("orderConfirm.ejs", {
    fullName,
    total,
    cart,
  });
});

// logout route
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/dbTest", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT CURDATE()");
    res.send(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Database error!");
  }
});

//profile route and update profile route
app.get("/profile", isUserAuthenticated, async (req, res) => {
  const sql = `SELECT first_Name, Last_Name, user_Name, email
                FROM users
                WHERE user_Name = ?`;

  const [rows] = await pool.query(sql, [req.session.user_Name]);

  if (rows.length === 0) {
    return res.redirect("/login");
  }

  res.render("profile.ejs", { user: rows[0], message: null });
});

app.post("/profile/update", isUserAuthenticated, async (req, res) => {
  const { first_Name, Last_Name, user_Name, email } = req.body;

  const sql = `UPDATE users
                SET first_Name = ?, Last_Name = ?, user_Name = ?, email = ?
                WHERE user_Name = ?`;

  await pool.query(sql, [
    first_Name,
    Last_Name,
    user_Name,
    email,
    req.session.user_Name,
  ]);

  req.session.user_Name = user_Name;

  const updatedUser = {
    first_Name,
    Last_Name,
    user_Name,
    email,
  };

  res.render("profile.ejs", {
    user: updatedUser,
    message: "Profile updated successfully!",
  });
});

// Google maps Api
app.get("/nearby", (req, res) => {
  res.render("nearby.ejs");
});

app.get("/nearby-books", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing lat or lng" });
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": "AIzaSyBqSVR_ln9qdxvCFnxg4l7FfdPFrUHoC94",
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.location,places.rating",
        },
        body: JSON.stringify({
          includedTypes: ["library", "book_store"],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: {
                latitude: Number(lat),
                longitude: Number(lng),
              },
              radius: 5000,
            },
          },
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Google Places error:", err);
    res.status(500).json({ error: "Could not fetch nearby places" });
  }
});
    let sqlParams = [first_Name, Last_Name, user_Name, email, password_hashed];
    const[rows] = await pool.query(sql, sqlParams);
    //starting the session
    req.session.authenticated = true;
    req.session.user_Name = user_Name;
    res.redirect('/signupSuccess');
});

app.get('/searchResults', async (req, res) => {
   let query = req.query.searchTitle;
   let url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyBh_tUuyGb8X7GrGSwOty0IP3VVB_WCABo`;

   try {
      const response = await fetch(url);
      const data = await response.json();
      let searchData = data.items || [];
      res.render('searchResults.ejs', { searchData, query});
   } catch (err) {
      res.render('searchResults.ejs', { searchData: [], query: ''});
   }
});

app.post('/addedToCart', (req, res) => {
   const {title, author} = req.body;
   let sql = `INSERT INTO books
               (title, author)
               VALUES(?, ?)`
   let sqlParams = [title, author];
   res.render('addedToCart.ejs');
});

app.get('/cart', (req, res) => {
   res.render('cart.ejs', { cart });
});

// checkout page route 
app.get('/pay', isUserAuthenticated, (req, res) => {
  const total = cart.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
   }, 0);

   res.render('pay.ejs', { cart, total });
});


//dbTest
app.listen(3000, () => {
  console.log("Express server running");
});
