const express = require('express');
const router = express.Router();
const Notice = require('../models/notice.model.js');
const Member = require('../models/member.model.js');
const fs = require("fs");
const path = require("path");
const createNotice = async (req, res) => {
    try {
        const { title, description, link } = req.body;
        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }

        // Handle file uploads
        const files = req.files && req.files.length > 0
            ? req.files.map(file => ({
                name: file.filename,
                url: file.path
            }))
            : [];

        const count = await Notice.countDocuments();
        const notice = new Notice({
            id: count + 1,
            title,
            description,
            date: new Date(),
            link: link || "",
            files
        });

        await notice.save();
        res.status(201).json({
            success: true,
            message: 'Notice created successfully',
            notice,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while creating the notice', error: error.message });
    }
};


const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find().sort({ date: -1 });
        res.status(200).json(notices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching notices' });
    }
};


const deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const notice = await Notice.findOne({ _id: id });
        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }

        if (notice.files && notice.files.length > 0) {
            notice.files.forEach(file => {
                const filePath = path.join(__dirname, "..", file.url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        await Notice.findByIdAndDelete(id);

        res.status(200).json({ message: "Notice deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while deleting the notice" });
    }
};

const addMember = async (req, res) => {
    try {
        // Check if the profile picture is provided
        if (!req.file) {
            return res.status(400).json({ message: 'Profile picture is required.' });
        }
        const profilePictureUrl = `/uploads/profile/${req.file.filename}`;

        const member = new Member({
            name: req.body.name,
            rec_designation: req.body.rec_designation,
            profile_picture_url: profilePictureUrl,
            profile_view_url: req.body.profile_view_url,
            seniority: req.body.seniority
        });

        await member.save();
        res.status(201).json(member);
    } catch (error) {
        // Rollback: Delete the uploaded image if an error occurs
        if (req.file) {
            const filePath = path.join(__dirname, '..', 'uploads', 'profile', req.file.filename);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to delete file: ${filePath}`);
                } else {
                    console.log(`Rolled back: Deleted file ${filePath}`);
                }
            });
        }

        res.status(400).json({ message: error.message });
    }
};

const getAllMembers = async (req, res) => {
    try {
        const members = await Member.find();
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Member
const updateMember = async (req, res) => {
    try {
        const memberId = req.params.id;
        const member = await Member.findById(memberId);

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Delete old profile picture if a new one is uploaded
        if (req.file && member.profile_picture_url) {
            const oldFilePath = path.join(__dirname, '..', member.profile_picture_url);
            fs.unlink(oldFilePath, (err) => {
                if (err) console.error(`Failed to delete old file: ${oldFilePath}`);
            });
        }

        const profilePictureUrl = req.file ? `/uploads/profile/${req.file.filename}` : member.profile_picture_url;

        member.name = req.body.name || member.name;
        member.rec_designation = req.body.rec_designation || member.rec_designation;
        member.profile_picture_url = profilePictureUrl;
        member.profile_view_url = req.body.profile_view_url || member.profile_view_url;
        member.seniority = req.body.seniority || member.seniority;

        await member.save();
        res.status(200).json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Member
const deleteMember = async (req, res) => {
    try {
        const memberId = req.params.id;
        const member = await Member.findByIdAndDelete(memberId);

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Delete profile picture
        if (member.profile_picture_url) {
            const filePath = path.join(__dirname, '..', member.profile_picture_url);
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Failed to delete file: ${filePath}`);
            });
        }

        res.status(200).json({ message: 'Member deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createNotice,
    getNotices,
    deleteNotice,
    addMember,
    getAllMembers,
    updateMember,
    deleteMember
};
