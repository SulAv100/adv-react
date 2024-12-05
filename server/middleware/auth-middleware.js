const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model.js");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token || token === undefined) {
    return res.status(404).json({ msg: "You could not be validated" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await userModel
      .findOne({ email: decoded.email })
      .select({ password: 0 });

    if (!user) {
      res.status(401).json({ msg: "Invalid user data" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(404).json({ msg: "Invalid token" });
  }
};
module.exports = authMiddleware;
