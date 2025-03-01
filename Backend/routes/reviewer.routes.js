const express = require('express');
const router = express.Router();
const reviewerController = require('../controllers/reviewer.controller.js');
const reviewerMiddileware = require('../middlewares/reviewer.auth.middlware.js')

router.post('/research-proposal/review/verify', reviewerMiddileware.authReview, reviewerController.verifyReviewer);

module.exports = router;
