const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/notice.controller.js');
const upload = require('../middlewares/upload.notices.js');
const uploadProfile = require('../middlewares/profileUpload.js');
const adminNoticerMiddileware = require('../middlewares/admin.noticer.auth.middleware.js')

router.post("/add", adminNoticerMiddileware.authAdminNoticer, upload.array("files", 5), noticeController.createNotice);
router.get('/get-notice', noticeController.getNotices);
router.delete('/delete/:id', adminNoticerMiddileware.authAdminNoticer, noticeController.deleteNotice);
router.post('/add-member', adminNoticerMiddileware.authAdminNoticer, uploadProfile.single('profile_picture'), noticeController.addMember);
router.get('/get-members', adminNoticerMiddileware.authAdminNoticer, noticeController.getAllMembers);
router.put('/members/:id', adminNoticerMiddileware.authAdminNoticer, uploadProfile.single('profile_picture'), noticeController.updateMember);

// Delete a member (DELETE)
router.delete('/members/:id', adminNoticerMiddileware.authAdminNoticer, noticeController.deleteMember);
module.exports = router;
