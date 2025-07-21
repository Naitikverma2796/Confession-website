# Blogging Website 📝

A simple full-stack blogging website built with Node.js, Express, PostgreSQL, and EJS. Users can write, edit, and view blog posts.

---

## 🚀 Features

- Create and manage blog posts
- Responsive UI with EJS templating
- PostgreSQL database integration
- Secure with dotenv environment variables

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- PostgreSQL
- EJS
- CSS (or Bootstrap/Tailwind if used)
- dotenv for environment management

---

## 🧑‍💻 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Naitikverma2796/Blogging-website.git
cd Blogging-website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a .env file in the root directory:
```bash
PGUSER=your_postgres_username
PGHOST=localhost
PGDATABASE=your_database_name
PGPASSWORD=your_password
PGPORT=5432
```

### 4. Database Setup

Run the following SQL in your PostgreSQL database to create the necessary table(s):

```sql
CREATE TABLE data_record (
  roomid SERIAL PRIMARY KEY,
  roomname TEXT NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username text NOT NULL,
  roomid text NOT NULL,
  roomname TEXT NOT NULL
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  timestamp TIMESTAMP default NOW(),
  roomid text NOT NULL,
  roomname text NOT NULL
);
```

### 5. Start the server

```bash
node index.js
Visit: http://localhost:3000
```
