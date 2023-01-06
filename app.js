require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 8005;
const cookieParser = require("cookie-parser");
// const DefaultData = require("./defaultdata");
require("./db/conn");
const cors = require("cors");
const router = require("./routes/router");
const products = require("./models/productsSchema");
// const jwt = require("jsonwebtoken");


// middleware
app.use(express.json());
app.use(cookieParser(""));
app.use(cors());

app.use(router);

app.listen(port,()=>{
    console.log(`your server is running on port ${port} `);
});

// DefaultData();
