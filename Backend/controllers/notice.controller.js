const express = require('express');
const router = express.Router();
const Notice = require('../models/notice.model.js');

const createNotice = async (req, res) => {
    try {
        const { title, description, link } = req.body;
        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'All fields (title, description, link) are required' });
        }
        const count = await Notice.countDocuments();
        const notice = new Notice({
            id: count + 1,
            title,
            description,
            link,
        });
        await notice.save();
        res.status(201).json({
            success: true,
            message: 'Notice created successfully',
            notice,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while creating the notice' });
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

const getNoticeById = async (req, res) => {
    try {
        const { id } = req.params;
        const notice = await Notice.findOne({ id });
        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }
        res.status(200).json(notice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the notice' });
    }
};

const updateNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, link } = req.body;
        const updatedNotice = await Notice.findOneAndUpdate(
            { id },
            { title, description, link, date: Date.now() },
            { new: true }
        );
        if (!updatedNotice) {
            return res.status(404).json({ message: 'Notice not found' });
        }
        res.status(200).json({
            message: 'Notice updated successfully',
            updatedNotice,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the notice' });
    }
};

const deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNotice = await Notice.findOneAndDelete({ _id: id });
        if (!deletedNotice) {
            return res.status(404).json({ message: 'Notice not found' });
        }
        res.status(200).json({ message: 'Notice deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the notice' });
    }
};

module.exports = {
    createNotice,
    getNotices,
    getNoticeById,
    updateNotice,
    deleteNotice,
};
