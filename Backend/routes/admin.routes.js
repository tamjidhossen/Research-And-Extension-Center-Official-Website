const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller.js');
const upload = require('../middlewares/uploadDocument.js');
const adminMiddileware = require('../middlewares/admin.auth.middleware.js')
router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);
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

router.get('/research-proposal/', adminMiddileware.authAdmin, adminController.getProposal);
router.post('/research-proposal/request-reset-password', adminController.requestPasswordReset);
router.post('/research-proposal/reset-password', adminController.resetPassword);

module.exports = router;
