const express = require("express");
const { registerAdminNoticer, loginAdminNoticer, getAllAdminNoticer, deleteAdminNoticer } = require("../controllers/admin.noticer.controller");
const adminMiddleware = require('../middlewares/admin.auth.middleware.js');

const router = express.Router();

// Route for registering an admin noticer
router.post("/register", adminMiddleware.authAdmin, registerAdminNoticer);

// Route for logging in an admin noticer
router.post("/login", loginAdminNoticer);

// Route for getting all admin noticers
router.get("/all", adminMiddleware.authAdmin, getAllAdminNoticer);

// Route for deleting an admin noticer
router.delete("/:id", adminMiddleware.authAdmin, deleteAdminNoticer);

module.exports = router;
