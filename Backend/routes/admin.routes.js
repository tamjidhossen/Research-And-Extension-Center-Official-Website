const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller.js');
const upload = require('../middlewares/uploadDocument.js');

router.post('/research-proposal/upload', upload.fields([
    { name: 'student_partA_en', maxCount: 1 },
    { name: 'student_partA_bn', maxCount: 1 },
    { name: 'student_partB_en', maxCount: 1 },
    { name: 'student_partB_bn', maxCount: 1 },
    { name: 'teacher_partA_en', maxCount: 1 },
    { name: 'teacher_partA_bn', maxCount: 1 },
    { name: 'teacher_partB_en', maxCount: 1 },
    { name: 'teacher_partB_bn', maxCount: 1 }
]),
    adminController.updatedDocument);

module.exports = router;
