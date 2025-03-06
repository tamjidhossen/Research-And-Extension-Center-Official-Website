const express = require("express");
const { registerAdminNoticer, loginAdminNoticer } = require("../controllers/admin.noticer.controller");
const adminMiddileware = require('../middlewares/admin.auth.middleware.js')

const router = express.Router();

// Route for registering an admin noticer
router.post("/register", adminMiddileware.authAdmin, registerAdminNoticer);

// Route for logging in an admin noticer
router.post("/login", loginAdminNoticer);

module.exports = router;
