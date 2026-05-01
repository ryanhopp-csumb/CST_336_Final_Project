import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
const app = express();
let cart = [
    {
        title: "The Midnight Garden",
        author: "Sarah Mitchell",
        price: 24.99,
        quantity: 1,
        image: ""
    },
    {
        title: "Echoes of the Past",
        author: "William Harrison",
        price: 19.99,
        quantity: 2,
        image: ""
    }
];

app.get('/cart', (req, res) => {
   res.render('cart.ejs', { cart });
});

app.post('/cart/remove', (req, res) => {
   const { title } = req.body;
   cart = cart.filter(item => item.title !== title);
   res.redirect('/cart');
});
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
app.get('/', (req, res) => {
   res.render('home.ejs')
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

// checkout page route 
app.get('/pay', (req, res) => {
  const total = cart.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
   }, 0);

   res.render('pay.ejs', { cart, total });
});

// Order Confirm page route
app.post('/place-order', (req, res) => {
   const { fullName, address, cardNumber, expiryDate, cvv } = req.body;

   const total = cart.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
   }, 0);

   res.render('orderConfirm.ejs', {
      fullName,
      total,
      cart
   });
});


//dbTest
app.listen(3000, ()=>{
    console.log("Express server running")
})
