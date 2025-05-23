const express = require('express');
const router = express.Router();
const teacherProposalController = require('../controllers/teacher.proposal.controller.js');
const studentProposalController = require('../controllers/student.proposal.controller.js');
const upload = require('../middlewares/uploadPDF.js');
const { verifyUpdateToken } = require('../middlewares/update.auth.middleware.js');

router.post('/teacher/submit', upload.fields([{ name: 'partA' }, { name: 'partB' }]), teacherProposalController.submitProposal);

// Add middleware to update routes
router.post('/teacher/update',
    upload.fields([{ name: 'partA' }, { name: 'partB' }]),
    verifyUpdateToken,
    teacherProposalController.updateProposal
);

router.post('/student/submit', upload.fields([{ name: 'partA' }, { name: 'partB' }]), studentProposalController.submitProposal);

router.post('/student/update',
    upload.fields([{ name: 'partA' }, { name: 'partB' }]),
    verifyUpdateToken,
    studentProposalController.updateProposal
);

router.get('/proposals', studentProposalController.getApprovedProposals, teacherProposalController.getApprovedProposals);

module.exports = router;
