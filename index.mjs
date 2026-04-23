import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool, replace values in red
const pool = mysql.createPool({
   host: "your_hostname",
   user: "your_username",
   password: "your_password",
   database: "your_database",
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

// signup page route 
app.get('/signup', (req, res) => {
   res.render('signup.ejs')
});

// checkout page route 
app.get('/checkout', (req, res) => {
   res.render('checkout.ejs')
});


//dbTest
app.listen(3000, ()=>{
    console.log("Express server running")
})
