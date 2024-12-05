const userModel = require("../models/user-model.js");
const bcrypt = require("bcryptjs");

const signup = async (req, res) => {
  try {
    console.log("Signup data", req.body);
    const { email, phoneNumber, password } = req.body;

    // Check if the user already exists
    const existingUser = await userModel.findOne({ $or: [{ email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user (no need to hash the password here)
    const newUser = new userModel({
      email,
      phoneNumber,
      password, // password will be hashed automatically by pre-save middleware
    });

    // Save the user to the database
    await newUser.save();

    // Generate a token for the user
    const token = await newUser.generateToken();

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    console.log("Login ko data", req.body);
    const { email, password } = req.body;

    // Try to find the user by email
    let user = await userModel.findOne({ email });

    console.log(user);
    console.log(user.password);
    console.log("User ko password", password);

    // Compare the entered password with the hashed password stored in the database
    const passwordCompare = await bcrypt.compare(password, user.password);
    console.log(passwordCompare);

    if (passwordCompare) {
      // Generate the JWT token if credentials are valid
      const token = await user.generateToken(); // Assuming generateToken method is available

      res
        .cookie("token", token, {
          httpOnly: true, // Ensures the token is not accessible from JavaScript
          secure: process.env.NODE_ENV === "production", // Use only over HTTPS in production
          sameSite: "strict", // Protects against CSRF
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Token expiration (30 days)
        })
        .json({ message: "Logged in successfully" });
    } else {
      return res.status(402).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUser = async (req, res) => {
  const userData = await userModel.find({}).select("-password");
  if (userData) {
    res.status(200).json(userData);
  }
};

const getProfile = async (req, res) => {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      return res.status(500).json({ msg: "Server error" });
    }
  };


module.exports = {
  login,
  signup,
  getUser,
  getProfile
};
