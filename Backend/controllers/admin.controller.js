const fs = require('fs');
const ProposalDocument = require('../models/proposal.document.model.js');

const updatedDocument = async (req, res, next) => {
    try {
        let proposalDoc = await ProposalDocument.findOne();
        if (!proposalDoc) {
            proposalDoc = new ProposalDocument({
                fiscal_year: "2025-2026",
                student: {
                    partA_url: { en: null, bn: null },
                    partB_url: { en: null, bn: null }
                },
                teacher: {
                    partA_url: { en: null, bn: null },
                    partB_url: { en: null, bn: null }
                }
            });
        }

        const uploadedFiles = [];

        // Function to delete old file before setting new path
        const setFilePath = (fieldName, currentPath) => {
            if (req.files[fieldName]) {
                const filePath = req.files[fieldName][0].path;
                uploadedFiles.push(filePath); // Track uploaded files

                // Delete the previous file if exists
                if (currentPath) {
                    fs.unlink(currentPath, (err) => {
                        if (err) console.error(`Failed to delete old file: ${currentPath}`, err);
                    });
                }
                return filePath;
            }
            return currentPath;
        };

        proposalDoc.fiscal_year = req.body.fiscal_year || proposalDoc.fiscal_year;

        // Check and update each document, deleting previous file if replaced
        proposalDoc.student.partA_url.en = setFilePath('student_partA_en', proposalDoc.student.partA_url.en);
        proposalDoc.student.partA_url.bn = setFilePath('student_partA_bn', proposalDoc.student.partA_url.bn);
        proposalDoc.student.partB_url.en = setFilePath('student_partB_en', proposalDoc.student.partB_url.en);
        proposalDoc.student.partB_url.bn = setFilePath('student_partB_bn', proposalDoc.student.partB_url.bn);
        proposalDoc.teacher.partA_url.en = setFilePath('teacher_partA_en', proposalDoc.teacher.partA_url.en);
        proposalDoc.teacher.partA_url.bn = setFilePath('teacher_partA_bn', proposalDoc.teacher.partA_url.bn);
        proposalDoc.teacher.partB_url.en = setFilePath('teacher_partB_en', proposalDoc.teacher.partB_url.en);
        proposalDoc.teacher.partB_url.bn = setFilePath('teacher_partB_bn', proposalDoc.teacher.partB_url.bn);

        // Save the updated document
        const updatedDocument = await proposalDoc.save();
        console.log("Updated Proposal Document:", updatedDocument);

        res.status(200).json({ message: "Proposal document updated successfully", updatedDocument });

    } catch (error) {
        console.error("Error inserting/updating document:", error);

        // Delete uploaded files if an error occurs
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) console.error(`Failed to delete file: ${file.path}`, err);
                });
            });
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { updatedDocument };
