// backend/server.js

const express = require("express");
const cors = require("cors");


const app = express();
app.use(express.json()); // To parse JSON requests
app.use(cors({
    origin: "http://localhost:3000",  // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"] // Specify allowed headers
}));


// Basic route
app.get("/", (req, res) => {
    res.send("Survey App Backend is running");
});

// Start server
const PORT = 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
