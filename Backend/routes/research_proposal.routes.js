const express = require('express');
const router = express.Router();
const teacherProposalController = require('../controllers/teacher.proposal.controller.js');
const upload = require('../middlewares/uploadPDF.js'); // Ensure this file exports `multer()`

// ✅ Route for submitting teacher proposals with PDF uploads
router.post('/teacher/submit', upload.fields([{ name: 'partA' }, { name: 'partB' }]), teacherProposalController.submitProposal);

module.exports = router;
