const AdminNoticer = require("../models/admin.noticer.model");
const jwt = require("jsonwebtoken");

module.exports.authAdminNoticer = async (req, res, next) => {
    let token = null;

    // Extract token from authorization header or cookies
    token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.SECRET_KEY_ADMIN);

        // Find the admin noticer by ID
        const user = await AdminNoticer.findOne({ _id: decoded._id });
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("Authentication Error:", err);
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};
