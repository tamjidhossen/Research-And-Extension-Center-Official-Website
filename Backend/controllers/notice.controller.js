const express = require("express");
const router = express.Router();
const Notice = require("../models/notice.model.js");
const fs = require("fs");
const path = require("path");
const createNotice = async (req, res) => {
  try {
    const { title, description, link } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Title and description are required",
        });
    }

    // Handle file uploads
    const files =
      req.files && req.files.length > 0
        ? req.files.map((file) => ({
            name: file.filename,
            url: file.path,
          }))
        : [];

    const count = await Notice.countDocuments();
    const notice = new Notice({
      id: count + 1,
      title,
      description,
      date: new Date(),
      link: link || "",
      files,
    });

    await notice.save();
    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      notice,
    });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while creating the notice",
        error: error.message,
      });
  }
};

const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ date: -1 });
    res.status(200).json(notices);
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching notices" });
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
      notice.files.forEach((file) => {
        const filePath = path.join(__dirname, "..", file.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Notice.findByIdAndDelete(id);

    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the notice" });
  }
};

module.exports = {
  createNotice,
  getNotices,
  deleteNotice,
};
