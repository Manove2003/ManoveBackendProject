const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile:", profile); // Log profile data
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          console.log("User found:", user); // Log found user
          return done(null, user);
        } else {
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName,
            phoneNumber: "N/A",
            role: "buyer", // Set default role as 'buyer'
          });
          await user.save();
          console.log("New user created:", user); // Log newly created user
          return done(null, user);
        }
      } catch (error) {
        console.error("Error during Google authentication:", error);
        return done(error, null);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "emails", "name"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Facebook profile:", profile); // Log profile data
        let user = await User.findOne({ facebookId: profile.id });
        if (user) {
          console.log("User found:", user); // Log found user
          return done(null, user);
        } else {
          user = new User({
            facebookId: profile.id,
            email: profile.emails[0].value,
            username: profile.name.givenName,
            phoneNumber: "N/A",
            role: "buyer", // Set default role as 'buyer'
          });
          await user.save();
          console.log("New user created:", user); // Log newly created user
          return done(null, user);
        }
      } catch (error) {
        console.error("Error during Facebook authentication:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error("Error during deserialization:", error);
    done(error, null);
  }
});

module.exports = passport;
