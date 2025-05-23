const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require("crypto");
const uploadDir = 'uploads/proposal';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const randomStr = crypto.randomBytes(4).toString("hex"); // Generates 8 random characters
        cb(null, `${file.fieldname}-${Date.now()}-${randomStr}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});
module.exports = upload;