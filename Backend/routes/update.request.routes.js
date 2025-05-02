const express = require('express');
const router = express.Router();
const updateRequestController = require('../controllers/update.request.controller.js');
const adminMiddleware = require('../middlewares/admin.auth.middleware.js');
const upload = require('../middlewares/uploadPDF.js');

router.post(
    '/send',
    adminMiddleware.authAdmin,
    updateRequestController.createRequest
);
router.get('/all', adminMiddleware.authAdmin, updateRequestController.getAllRequests);
router.get('/:id', adminMiddleware.authAdmin, updateRequestController.getRequestById);
router.delete('/:id', adminMiddleware.authAdmin, updateRequestController.deleteRequest);

// Public routes
router.get('/verify/:token', updateRequestController.verifyRequestToken);

module.exports = router;