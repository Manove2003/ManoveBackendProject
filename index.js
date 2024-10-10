const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const passport = require("./config/passport"); // Import your passport configuration

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
