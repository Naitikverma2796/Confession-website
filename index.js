import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from 'uuid';
import pg from "pg";
import session from 'express-session';


const app = express();
const port = 3000;
const db = new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"postgres",
  password: "NaitikvSQL",
  port: 5432,
});

app.use(session({
  secret: 'yourSecretKeyHere',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
db.connect();

app.post("/save", async(req,res) => {
  const title = req.body["title"];
  const roomId = req.body.roomId;

  req.session.roomId = roomId;
  req.session.roomName = title;

  try {
    const existingRoom = await db.query("SELECT * FROM data_record WHERE roomid = $1", [roomId]);

  if (existingRoom.rowCount === 0) {
  await db.query("INSERT INTO data_record (roomid, roomname) VALUES ($1, $2)", [roomId, title]);
  }

  // Step 3: Fetch all users in that room
  const usersResult = await db.query("SELECT username FROM users WHERE roomid = $1 AND roomname = $2", [roomId, title]);

  const postsResult = await db.query(
    "SELECT id, content, timestamp, roomname FROM posts WHERE roomid = $1 ORDER BY timestamp ASC",
    [roomId]
  );

  const posts = postsResult.rows.map(post => ({
    id: post.id,
    content: post.content,
    roomname: post.roomname,
    date: new Date(post.timestamp).toLocaleString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }));

  res.render("AllBlogs.ejs", {
    roomId:roomId,
    title:title,
    posts:posts,
    participants: usersResult.rows
  });

  } catch (error) {
    console.log(error);
  }
});

app.get("/view/:id", async(req, res) => {
    // let index = req.params.id;
    // let post = posts[index];
    // res.render("EditBlogs.ejs", {
    //     postId: index,
    //     content: post.content
    // });
  const postId = req.params.id;
  const roomId = req.session.roomId;

  if (!roomId) {
    return res.redirect("/");
  }

  try {
    const result = await db.query(
      "SELECT content FROM posts WHERE id = $1 AND roomid = $2",
      [postId, roomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Post not found");
    }

    res.render("EditBlogs.ejs", {
      postId: postId,
      content: result.rows[0].content
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.get("/edit/:id", async(req,res) => {
  // let index = req.params.id;
  // let post = posts[index];
  // res.render("MyBlogs.ejs",{
  //       postId: index,
  //       content: post.content
  //   });
  const postId = req.params.id;
  const roomId = req.session.roomId;

  if (!roomId) {
    return res.redirect("/");
  }

  try {
    const result = await db.query(
      "SELECT content FROM posts WHERE id = $1 AND roomid = $2",
      [postId, roomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Post not found");
    }

    res.render("MyBlogs.ejs", {
      postId: postId,
      content: result.rows[0].content
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }

});

app.post("/delete", async(req, res) => {
    // let index = req.body["postId"];

    // deletePost(index);
    // res.redirect("/view-blog");
      const postId = req.body["postId"];
  const roomId = req.session.roomId;

  if (!roomId) {
    return res.redirect("/");
  }

  try {
    await db.query("DELETE FROM posts WHERE id = $1 AND roomid = $2", [postId, roomId]);
    res.redirect("/view-blog");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Server error while deleting post.");
  }
});

app.post("/update", async(req,res) => {
  // let content = req.body["content"];
  // let index = req.body["index"];

  // editPost(index, content);
  // res.redirect("/view-blog");

  const content = req.body["content"];
  const postId = req.body["postId"];
  const roomId = req.session.roomId;

  if (!roomId) {
    return res.redirect("/");
  }

  try {
    await db.query(
      "UPDATE posts SET content = $1 WHERE id = $2 AND roomid = $3",
      [content, postId, roomId]
    );

    res.redirect("/view-blog");
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).send("Server error while updating post.");
  }
});

app.post("/re-enter", async(req,res)=>{
  let userName = req.body["username"];
  let roomName = req.body["roomName"];
  let roomId = req.body["roomId"];

  req.session.roomId = roomId;
  req.session.roomName = roomName;
  req.session.userName = userName;

  try {
    // Step 1: Check if the room exists
    const roomCheck = await db.query("SELECT * FROM users WHERE roomid = $1 AND roomname = $2 AND username = $3", [roomId, roomName, userName]);

    if (roomCheck.rowCount === 0) {
      // Room not found
      return res.status(400).send("Invalid Room ID or Room Name.");
    }

    // Step 3: Fetch all users in that room
    const usersResult = await db.query("SELECT username FROM users WHERE roomid = $1 AND roomname = $2", [roomId, roomName]);

    const postsResult = await db.query(
      "SELECT id, content, timestamp FROM posts WHERE roomid = $1 AND roomname = $2 ORDER BY timestamp ASC",
      [roomId, roomName]
    );

    // Format posts like your in-memory format
    const formattedPosts = postsResult.rows.map(post => ({
      id: post.id,
      content: post.content,
      date: new Date(post.timestamp).toLocaleString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    }));

    res.render("AllBlogs.ejs", {
      roomId: roomId,
      title: roomName,
      posts: formattedPosts,
      participants: usersResult.rows
    });
  } catch (error) {
    console.error("Error in /re-enter:", error);
    res.status(500).send("Server error");
  }

});

app.post("/sent", async(req, res) => {
  let userName = req.body["username"];
  let roomName = req.body["roomName"];
  let roomId = req.body["roomId"];

  req.session.roomId = roomId;
  req.session.roomName = roomName;
  req.session.userName = userName;

  try {
    // Step 1: Check if the room exists
    const roomCheck = await db.query("SELECT * FROM data_record WHERE roomid = $1 AND roomname = $2", [roomId, roomName]);

    if (roomCheck.rowCount === 0) {
      // Room not found
      return res.status(400).send("Invalid Room ID or Room Name.");
    }

    // Step 2: Insert user into users table
    await db.query("INSERT INTO users (username, roomid, roomname) VALUES ($1, $2, $3)", [userName, roomId, roomName]);

    // Step 3: Fetch all users in that room
    const usersResult = await db.query("SELECT username FROM users WHERE roomid = $1 AND roomname = $2", [roomId, roomName]);

    const postsResult = await db.query(
      "SELECT id, content, timestamp FROM posts WHERE roomid = $1 AND roomname = $2 ORDER BY timestamp ASC",
      [roomId, roomName]
    );

    // Format posts like your in-memory format
    const formattedPosts = postsResult.rows.map(post => ({
      id: post.id,
      content: post.content,
      date: new Date(post.timestamp).toLocaleString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    }));

    res.render("AllBlogs.ejs", {
      roomId: roomId,
      title: roomName,
      posts: formattedPosts,
      participants: usersResult.rows
    });
  } catch (error) {
    console.error("Error in /sent:", error);
    res.status(500).send("Server error");
  }
});

app.get("/",(req,res)=> {
  res.render("index.ejs");
});

app.get("/Home", (req,res)=>{
  res.render("index.ejs");
});

app.get("/Contacts", (req, res) => {
  res.render("Contact.ejs");
});

app.post("/add", async(req, res) => {
    let content = req.body["content"];
    const {roomId,roomName} = req.session;

     if (!roomId || !roomName) return res.redirect("/");

  try {
    await db.query("INSERT INTO posts (content, roomid, roomname) VALUES ($1, $2, $3)", [content, roomId, roomName]);
    res.redirect("/view-blog");
  } catch (err) {
    console.error("Error inserting post:", err);
    res.status(500).send("Server error");
  }
});

app.get("/edit-blog", (req, res) => {
  const id = uuidv4();
  res.render("MyBlogs.ejs", {
    roomId:id
  });
});

app.get("/view-blog", async(req, res) => {
  const { roomId, roomName } = req.session;

  if (!roomId || !roomName) {
    return res.redirect("/"); // or show an error
  }

  try {
    const usersResult = await db.query(
      "SELECT username FROM users WHERE roomid = $1 AND roomname = $2",
      [roomId, roomName]
    );

    const postsResult = await db.query(
      "SELECT id, content, timestamp FROM posts WHERE roomid = $1 AND roomname = $2 ORDER BY timestamp ASC",
      [roomId, roomName]
    );

    // Format posts like your in-memory format
    const formattedPosts = postsResult.rows.map(post => ({
      id: post.id,
      content: post.content,
      date: new Date(post.timestamp).toLocaleString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    }));

    res.render("AllBlogs.ejs", {
      roomId: roomId,
      title: roomName,
      posts: formattedPosts,
      participants: usersResult.rows
    });

  } catch (err) {
    console.error("Error loading posts:", err);
    res.status(500).send("Server error");
  }
});

app.listen(port, () => {
  // addPost(`The world is no longer divided into "vacation spots" and "work zones." With a laptop in one hand and a passport in the other, remote workers are redefining what it means to live a balanced life. Cafés in Lisbon become makeshift boardrooms, and beaches in Bali hum with the quiet clicking of keyboards. But it's not just about changing locations—it's about changing perspective. Remote work forces you to adapt, to blend exploration with discipline, and to find inspiration in unfamiliar places. You learn to manage time zones like a pro and discover that productivity thrives not in cubicles, but in freedom. Yes, there are challenges. Shaky WiFi, lonely evenings, and a constant hunt for power outlets. But the trade-off? Waking up in a new city with fresh ideas and renewed energy. In this digital age, maybe work isn't a place you go to anymore. Maybe it's just something you carry with you—like curiosity.`);
  // addPost(`Artificial Intelligence is no longer a distant dream — it's now embedded in our smartphones, homes, and even cars. From personalized recommendations to self-driving vehicles, AI is transforming every industry. But with great power comes great responsibility. As we move toward more automation, it's critical to ask: are our policies, ethics, and societies ready to keep up?`);
  // addPost(`We often feel guilty when we're not doing something. In a world that praises the hustle, taking a break can feel like slacking off. But here’s the twist: doing nothing — even for just a few minutes — can actually reset your brain in the best way possible. Ever notice how your best ideas come while you're in the shower or taking a walk? That’s your brain saying “thanks” for the space to breathe. When you give your mind some quiet, it starts to connect dots you didn’t even know existed. So next time you feel stuck or burnt out, don’t push harder. Step back. Sit with a cup of tea. Stare out the window. Let your thoughts wander. You might just come back sharper, calmer, and more focused than before. Because sometimes, the smartest move is to pause.`);
  console.log(`Listening on port ${port}`);
});