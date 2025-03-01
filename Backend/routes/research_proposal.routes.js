const express = require('express');
const router = express.Router();
const teacherProposalController = require('../controllers/teacher.proposal.controller.js');
const studentProposalController = require('../controllers/student.proposal.controller.js');
const upload = require('../middlewares/uploadPDF.js');

router.post('/teacher/submit', upload.fields([{ name: 'partA' }, { name: 'partB' }]), teacherProposalController.submitProposal);
router.post('/teacher/update', upload.fields([{ name: 'partA' }, { name: 'partB' }]), teacherProposalController.updateProposal);
router.post('/student/submit', upload.fields([{ name: 'partA' }, { name: 'partB' }]), studentProposalController.submitProposal);
router.post('/student/update', upload.fields([{ name: 'partA' }, { name: 'partB' }]), studentProposalController.updateProposal);

module.exports = router;
