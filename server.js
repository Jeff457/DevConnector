const express = require("express");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
const app = express();

connectDB();

app.get("/", (req, res) => res.send("API Running"));

// routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/post", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/users", require("./routes/api/users"));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));