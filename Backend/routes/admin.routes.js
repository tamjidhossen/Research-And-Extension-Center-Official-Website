const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller.js');
const upload = require('../middlewares/uploadDocument.js');
const adminMiddileware = require('../middlewares/admin.auth.middleware.js')


router.post('/register', adminMiddileware.authAdmin, adminController.registerAdmin);
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
router.post('/research-proposal/approval-budget', adminMiddileware.authAdmin, adminController.updateApprovalBudget);
router.post('/research-proposal/request-reset-password', adminController.requestPasswordReset);
router.post('/research-proposal/reset-password', adminController.resetPassword);
router.post('/research-proposal/sent-to-reviewer', adminMiddileware.authAdmin, adminController.sentToReviewer);
router.post('/research-proposal/fiscal-year/update', adminMiddileware.authAdmin, adminController.updateFiscalYear);
router.put('/research-proposal/registration-status/update/:value', adminMiddileware.authAdmin, adminController.updateRegistrationOpen);
router.post('/reviewer/add', adminMiddileware.authAdmin, adminController.addReviewer);
router.put("/reviewer/update/:id", adminMiddileware.authAdmin, adminController.updateReviewer);
router.delete("/reviewer/delete/:id", adminMiddileware.authAdmin, adminController.deleteReviewer);
router.get("/reviewer/:id", adminMiddileware.authAdmin, adminController.getReviewerById);
router.get("/get-reviewers", adminMiddileware.authAdmin, adminController.getAllReviewers);
router.get('/research-proposal/overviews', adminMiddileware.authAdmin, adminController.getProposalOverviews);
router.put('/research-proposal/status-update/:proposal_type/:proposal_id/:status', adminMiddileware.authAdmin, adminController.updateProposalStatus);

module.exports = router;
