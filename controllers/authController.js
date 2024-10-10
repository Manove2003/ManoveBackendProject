const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Updated expiration time
  );
};

// Login handler
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(`Attempting login for email: ${email}`); // Debugging log

    // Check if user exists
    const user = await User.findOne({ email });
    console.log("Email check");

    if (!user) {
      console.log(`User not found: ${email}`); // Debugging log
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const passwordMatch = await user.matchPassword(password);
    console.log(`Password check for email: ${email}`);

    if (!passwordMatch) {
      console.log(`Password mismatch for email: ${email}`); // Debugging log
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token and respond
    const token = generateToken(user);
    res.json({
      token,
      user: {
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Signup handler
exports.signup = async (req, res) => {
  const { email, password, username, phoneNumber } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Validate password length
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    // Create a new user with the default role "buyer"
    const user = new User({
      email,
      password, // This will be hashed in the pre-save hook
      username,
      phoneNumber,
      role: "buyer", // Assigning the default role here
    });

    await user.save();
    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ message: "Email already in use" });
    }
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
``;
// OAuth Callbacks
// exports.googleCallback = async (req, res) => {
//   console.log("Google callback route hit");
//   try {
//     if (!req.user) {
//       throw new Error("User not found in request");
//     }
//     const user = req.user;
//     const token = generateToken(user);

//     res.redirect(
//       `http://localhost:3000/welcome?token=${token}&role=${user.role}`
//     );
//   } catch (error) {
//     console.error("Google callback error:", error);
//     res
//       .status(500)
//       .json({ message: "Server error during Google authentication" });
//   }
// };

exports.googleCallback = async (req, res) => {
  console.log("Google callback route hit");
  try {
    if (!req.user) {
      throw new Error("User not found in request");
    }

    // Fetch the user from the database to ensure the role is up-to-date
    const user = await User.findById(req.user._id);

    // If the user is not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new token with the updated user information
    const token = generateToken(user);

    // Redirect to the frontend with the token and current role
    res.redirect(
      `http://localhost:3000/welcome?token=${token}&role=${user.role}`
    );
  } catch (error) {
    console.error("Google callback error:", error);
    res
      .status(500)
      .json({ message: "Server error during Google authentication" });
  }
};

exports.facebookCallback = async (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user);
    res.redirect(`http://localhost:3000?token=${token}`); // Fixed URL format
  } catch (error) {
    console.error("Facebook callback error:", error);
    res
      .status(500)
      .json({ message: "Server error during Facebook authentication" });
  }
};

// Update user role
exports.updateRole = async (req, res) => {
  const { role } = req.body;

  if (!["buyer", "seller"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({
      message: "Role updated successfully",
      user: {
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Role update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
