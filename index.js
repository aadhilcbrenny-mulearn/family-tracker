import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "1234",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries where user_id = $1",[currentUserId]);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

async function currentUser(){
  const result = await db.query("select * from users");
  users = result.rows;
  return  users.find((user) => user.id == currentUserId); 
}
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const user = await currentUser();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: user.color,
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const pattern_match =  await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );
    const equal_match =  await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE  $1;",
      [input.toLowerCase()]
    );
    const result = pattern_match.rows.length > 1 ? equal_match : pattern_match;
    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code,user_id) VALUES ($1,$2)",
        [countryCode,currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
      const countries = await checkVisisted();
      const user = await currentUser();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        users: users,
        color: user.color,
        error : "Country already taken, try again.",
      });     
    }
  } catch (err) {
    console.log(err);
    const countries = await checkVisisted();
    const user = await currentUser();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: users,
      color: user.color,
      error : "Country not found, try again."
    });
  }
});
app.post("/user", async (req, res) => {
  if(req.body.add == "new"){
    res.render("new.ejs");
  }else{
    currentUserId = parseInt(req.body.user);
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const name = req.body.name;
  const color = req.body.color;
  const result = await db.query("insert into users (name,color) values ($1,$2) returning *;",[name,color]);
  currentUserId = result.rows[0].id;
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
