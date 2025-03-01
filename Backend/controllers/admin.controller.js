const fs = require('fs');
const ProposalDocument = require('../models/proposal.document.model.js');
const ProposalUpdateRequest = require('../models/update.request.model.js');
const { TeacherProposal } = require('../models/teacher.proposal.model.js');
const { StudentProposal } = require('../models/student.proposal.model.js');
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
const updateRequestStatus = async (req, res) => {
    try {
        const { request_id } = req.params;
        const { status, admin_response, requester_type } = req.body;

        // 🔹 Check if Update Request Exists
        const request = await ProposalUpdateRequest.findById(request_id);
        let proposal;
        if (requester_type === "student") {
            proposal = await StudentProposal.findById(request.proposal_id);
        }
        if (requester_type === "teacher") {
            proposal = await TeacherProposal.findById(request.proposal_id);
        }
        if (!request) {
            return res.status(404).json({ error: "Update request not found" });
        }
        if (!proposal) {
            return res.status(404).json({ error: "Proposal request not found" });
        }
        request.status = status;
        request.admin_response = admin_response;
        const token = proposal.generateUpdateToken();
        await request.save();

        res.status(200).json({ message: `Request ${status} successfully`, token: token });

    } catch (error) {
        console.error("Error updating request status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { updatedDocument, updateRequestStatus };
