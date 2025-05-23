const adminModel = require("../models/admin.model.js");
const jwt = require("jsonwebtoken");

module.exports.authAdmin = async (req, res, next) => {
  let token = null;
  token = req.headers.authorization?.split(" ")[1];
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY_ADMIN);
    const user = await adminModel.findOne({ _id: decoded._id });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    // console.error("Authentication Error:", err);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
