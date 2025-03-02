const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/notice.controller.js');
const adminAuth = require('../middlewares/admin.auth.middleware.js')

router.post('/add', adminAuth.authAdmin, noticeController.createNotice);
router.get('/get-notice', noticeController.getNotices);
router.delete('/delete/:id', adminAuth.authAdmin, noticeController.deleteNotice);

module.exports = router;
