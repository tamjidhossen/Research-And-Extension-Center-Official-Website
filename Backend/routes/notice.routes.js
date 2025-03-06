const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/notice.controller.js');
const upload = require('../middlewares/upload.notices.js');
const adminNoticerMiddileware = require('../middlewares/admin.noticer.auth.middleware.js')

router.post("/add", adminNoticerMiddileware.authAdminNoticer, upload.array("files", 5), noticeController.createNotice);
router.get('/get-notice', noticeController.getNotices);
router.delete('/delete/:id', adminNoticerMiddileware.authAdminNoticer, noticeController.deleteNotice);

module.exports = router;
