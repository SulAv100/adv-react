const express = require("express");
const router = express.Router();
const authController = require("../controllers/user-controller.js");
const authMiddleware = require("../middleware/auth-middleware.js")

router.route("/login").post(authController.login);
router.route("/signup").post(authController.signup);
router.route("/getUser").get(authController.getUser);
router.route('/getProfile').get(authMiddleware,authController.getProfile);



module.exports = router;
