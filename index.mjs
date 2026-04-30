import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
const app = express();
let cart = [
    { title: "The Midnight Garden", author: "Sarah Mitchell", price: 24.99 },
    { title: "Echoes of the Past", author: "William Harrison", price: 19.99 }
];
app.set('view engine', 'ejs');
app.use(express.static('public'));
//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool, replace values in red
const pool = mysql.createPool({
   host: "hngomrlb3vfq3jcr.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
   user: "aa3dyc0mw8c8zb5t",
   password: "qd0qhbuo6ce2ccpz",
   database: "bao4zpfnzi38d977",
   connectionLimit: 10,
   waitForConnections: true
});

//routes
app.get('/', async(req, res) => {
   let url = 'https://www.googleapis.com/books/v1/volumes?q=SEARCH_TERM&key=AIzaSyBh_tUuyGb8X7GrGSwOty0IP3VVB_WCABo';

   try {
      const response = await fetch(url);
      if (!response.ok) {
         throw new Error("There was an error accessing the API");
      }
      const data = await response.json();
      //console.log(data);
      let homeData = data.items;
      console.log(homeData);
      res.render('home.ejs', {homeData});
   } catch (err) {
      if (err instanceof TypeError) {
         res.render('home.ejs', { message: 'There was an error accessing the API (network failure)' });
      } else {
         res.render('Error', { message: "Couldn't load the books"});
      }
   }
});

app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

// login page route 
app.get('/login', (req, res) => {
   res.render('login.ejs')
});

// signup success page route 
app.get('/signupSuccess', (req, res) => {
   res.render('signupSuccess.ejs')
});

// signup page route 
app.get('/signup', (req, res) => {
   res.render('signup.ejs')
});

// adding the new profile info (from the signup form) to our database
app.post('/signupForm', async (req, res) => {
    let {first_Name, Last_Name, user_Name, password, email} = req.body;
    let password_hashed = await bcrypt.hash(password, 11); // hashes the password. 11 is for 2^11 operations a hacker would have to do to get the password. we can adjust from 10-12.
    let sql = `INSERT INTO users
               (first_Name, Last_Name, user_Name, email, password_hashed)
               VALUES (?, ?, ?, ?, ?)`;
    let sqlParams = [first_Name, Last_Name, user_Name, email, password_hashed];
    const[rows] = await pool.query(sql, sqlParams);

    res.redirect('/signupSuccess');
})
app.get('/cart', (req, res) => {
   res.render('cart.ejs', { cart });
});
// checkout page route 
app.get('/pay', (req, res) => {
   res.render('pay.ejs')
});


//dbTest
app.listen(3000, ()=>{
    console.log("Express server running")
})
