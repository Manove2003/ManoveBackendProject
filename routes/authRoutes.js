const express = require("express");
const passport = require("passport"); // Add this line
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  register,
  login,
  getProfile,
  updateRole,
  googleCallback,
  signup,
  facebookCallback,
} = require("../controllers/authController");

// Login route
router.post("/login", login);

// Signup route
router.post("/signup", signup);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  googleCallback
);
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/", session: false }),
  facebookCallback
);

// Update role route
router.put("/update-role", protect, updateRole);

module.exports = router;
