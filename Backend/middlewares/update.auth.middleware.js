const jwt = require('jsonwebtoken');

const verifyUpdateToken = async (req, res, next) => {
    try {
        const { update_token } = req.body;
        if (!update_token) {
            // Delete any uploaded files
            if (req.files) {
                Object.values(req.files).flat().forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error(`Failed to delete file: ${file.path}`, err);
                    });
                });
            }
            return res.status(401).json({
                success: false,
                message: "Update token is required"
            });
        }

        try {
            // Verify the token
            const decoded = jwt.verify(update_token, process.env.SECRET_KEY_UPDATE_REQUEST);
            // Add decoded data to request
            req.updateData = decoded;
            next();
        } catch (error) {
            // Delete any uploaded files
            if (req.files) {
                Object.values(req.files).flat().forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error(`Failed to delete file: ${file.path}`, err);
                    });
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Update token has expired"
                });
            }

            return res.status(401).json({
                success: false,
                message: "Invalid update token"
            });
        }
    } catch (error) {
        console.error("Update auth middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { verifyUpdateToken };