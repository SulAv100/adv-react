const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// hashing the password

userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

// generating a token

userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      userId: this._id.toString(),
      phoneNumber: this.phoneNumber,
      email: this.email,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "2d",
    }
  );
};

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
