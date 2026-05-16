# Family Travel Tracker

A Node.js, Express, EJS, and PostgreSQL web app for tracking the countries each family member has visited. The app displays a world map, lets users switch between family members, highlights visited countries in each member's chosen color, and supports adding new family members.

## Features

- View visited countries on an interactive SVG world map
- Track visited countries separately for each family member
- Add countries by typing a country name
- Add new family members with a custom display color
- Store users and visited countries in PostgreSQL

## Tech Stack

- Node.js
- Express
- EJS
- PostgreSQL
- `pg`
- `body-parser`

## Project Structure

```text
.
|-- index.js              # Main Express app
|-- solution.js           # Alternate/course solution version
|-- queries.sql           # SQL examples and project table setup
|-- package.json
|-- public/
|   `-- styles/
|       |-- main.css
|       `-- new.css
`-- views/
    |-- index.ejs         # Main travel tracker page
    `-- new.ejs           # Add family member page
```

## Prerequisites

- Node.js installed
- PostgreSQL installed and running
- A PostgreSQL database named `World`
- A `countries` table containing at least:
  - `country_code`
  - `country_name`

The app currently connects to PostgreSQL with these settings in `index.js`:

```js
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "1234",
  port: 5432,
});
```

Update these values if your local PostgreSQL username, password, database name, or port are different.

## Database Setup

Run the project setup section in `queries.sql` to create the required app tables:

```sql
DROP TABLE IF EXISTS visited_countries, users;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(15) UNIQUE NOT NULL,
  color VARCHAR(15)
);

CREATE TABLE visited_countries(
  id SERIAL PRIMARY KEY,
  country_code CHAR(2) NOT NULL,
  user_id INTEGER REFERENCES users(id)
);

INSERT INTO users (name, color)
VALUES ('Angela', 'teal'), ('Jack', 'powderblue');

INSERT INTO visited_countries (country_code, user_id)
VALUES ('FR', 1), ('GB', 1), ('CA', 2), ('FR', 2);
```

This project also expects a `countries` lookup table. If you are following the course project this repository comes from, import the provided countries data into the `World` database before running the app.

## Installation

Install dependencies:

```bash
npm install
```

## Running the App

Start the server:

```bash
node index.js
```

Then open:

```text
http://localhost:3000
```

## App Routes

- `GET /` - Show the selected user's visited countries on the map
- `POST /add` - Add a visited country for the selected user
- `POST /user` - Switch users or open the new family member form
- `POST /new` - Create a new family member

## Notes

- `currentUserId` is stored in memory, so the selected user resets when the server restarts.
- Duplicate country entries are handled by showing an error message.
- Country lookup uses the `countries` table and matches against `country_name`.
