// backend/server.js

const express = require("express");


const app = express();
app.use(express.json()); // To parse JSON requests

// Basic route
app.get("/", (req, res) => {
    res.send("Survey App Backend is running");
});

// Start server
const PORT = 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
