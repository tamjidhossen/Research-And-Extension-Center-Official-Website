const express = require('express');
const router = express.Router();
const reviewerController = require('../controllers/reviewer.controller.js');
const reviewerMiddileware = require('../middlewares/reviewer.auth.middlware.js')
const upload = require("../middlewares/uploadMarkSheet.js");
const uploadInvoice = require("../middlewares/uploadInvoice.js");

router.post('/research-proposal/review/verify', reviewerMiddileware.authReview, reviewerController.verifyReviewer);
router.post('/research-proposal/submit/mark', reviewerMiddileware.authReview, upload.single("marksheet"), reviewerController.addMark);
router.post('/research-proposal/submit/invoice', reviewerMiddileware.authenticate, uploadInvoice.single("invoice"), reviewerController.submitInvoice);
router.post('/research-proposal/submit/invoice/verify', reviewerMiddileware.authenticate, reviewerController.invoiceVerify);


module.exports = router;
