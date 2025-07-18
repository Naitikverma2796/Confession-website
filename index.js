import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));




// Data Center
let posts = [];


// Post Constructor
function Post(title, content) {
    this.title = title;
    this.content = content;
    this.rawDate = new Date();
    this.date = this.rawDate.toLocaleString('en-GB', {
  weekday: 'long',   // Adds the day name
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true       // AM/PM format
});
}

// Add Post
function addPost(title, content) {
    let post = new Post(title, content);
    posts.push(post);
}

// Delete Post
function deletePost(index) {
    posts.splice(index, 1);
}

// Edit Post
function editPost(index, title, content) {
    posts[index] = new Post(title, content);
}

app.post("/save", (req, res) => {
    let title = req.body["title"];
    let content = req.body["content"];
    
    addPost(title, content);
    res.redirect("/view-blog");
});

app.get("/view/:id", (req, res) => {
    let index = req.params.id;
    let post = posts[index];
    res.render("EditBlogs.ejs", {
        postId: index,
        title: post.title,
        content: post.content
    });
});

app.get("/edit/:id", (req,res) => {
  let index = req.params.id;
  let post = posts[index];
  res.render("MyBlogs.ejs",{
        postId: index,
        title: post.title,
        content: post.content
    });
});

app.post("/delete", (req, res) => {
    let index = req.body["postId"];
    deletePost(index);
    res.redirect("/view-blog");
});

app.post("/update", (req,res) => {
  let title = req.body["title"];
  let content = req.body["content"];
  let index = req.body["index"];
    
  editPost(index,title, content);
  res.redirect("/view-blog");
});

app.post("/sent", (req, res) => {
    res.redirect("/");
});

app.get("/",(req,res)=> {
    res.render("index.ejs",{posts: posts});
});

app.get("/Home", (req, res) => {
  res.render("index.ejs", {posts: posts});
});

app.get("/Contacts", (req, res) => {
  res.render("Contact.ejs");
});

app.get("/edit-blog", (req, res) => {
  res.render("MyBlogs.ejs");
});

app.get("/view-blog", (req, res) => {
  res.render("AllBlogs.ejs", {posts: posts});
});

app.listen(port, () => {
  addPost(`Wandering Minds and WiFi: Why Remote Work is Rewriting the Travel Story`,`The world is no longer divided into "vacation spots" and "work zones." With a laptop in one hand and a passport in the other, remote workers are redefining what it means to live a balanced life. Cafés in Lisbon become makeshift boardrooms, and beaches in Bali hum with the quiet clicking of keyboards. But it's not just about changing locations—it's about changing perspective. Remote work forces you to adapt, to blend exploration with discipline, and to find inspiration in unfamiliar places. You learn to manage time zones like a pro and discover that productivity thrives not in cubicles, but in freedom. Yes, there are challenges. Shaky WiFi, lonely evenings, and a constant hunt for power outlets. But the trade-off? Waking up in a new city with fresh ideas and renewed energy. In this digital age, maybe work isn't a place you go to anymore. Maybe it's just something you carry with you—like curiosity.`);
  addPost(`The Rise of AI: Are We Ready for the Future?`,`Artificial Intelligence is no longer a distant dream — it's now embedded in our smartphones, homes, and even cars. From personalized recommendations to self-driving vehicles, AI is transforming every industry. But with great power comes great responsibility. As we move toward more automation, it's critical to ask: are our policies, ethics, and societies ready to keep up?`);
  addPost(`The Power of Doing Nothing (Yes, Really)`,`We often feel guilty when we're not doing something. In a world that praises the hustle, taking a break can feel like slacking off. But here’s the twist: doing nothing — even for just a few minutes — can actually reset your brain in the best way possible. Ever notice how your best ideas come while you're in the shower or taking a walk? That’s your brain saying “thanks” for the space to breathe. When you give your mind some quiet, it starts to connect dots you didn’t even know existed. So next time you feel stuck or burnt out, don’t push harder. Step back. Sit with a cup of tea. Stare out the window. Let your thoughts wander. You might just come back sharper, calmer, and more focused than before. Because sometimes, the smartest move is to pause.`);
  console.log(`Listening on port ${port}`);
});