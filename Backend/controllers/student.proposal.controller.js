const fs = require('fs');
const { StudentProposal } = require('../models/student.proposal.model.js');
const ProposalDocument = require('../models/proposal.document.model.js');
const Request = require('../models/request.model.js');
const queueController = require('../controllers/request.queue.controller.js');

const submitProposal = async (req, res) => {
    try {
        const firstDocument = await ProposalDocument.findOne();
        if (!firstDocument || firstDocument.registrationOpen === false) {
            if (req.files['partA'] && req.files['partA'][0].path) fs.unlinkSync(req.files['partA'][0].path);
            if (req.files['partB'] && req.files['partB'][0].path) fs.unlinkSync(req.files['partB'][0].path);
            return res.status(400).json({ success: false, message: "Application process not started" });
        }

        const {
            project_director, department, faculty, session, roll_no,
            cgpa_honours, supervisor, project_title, project_details, total_budget
        } = req.body;
        const proposal = new StudentProposal({
            proposal_number: 0,
            proposal_type: "student",
            fiscal_year: firstDocument.fiscal_year,
            project_director: JSON.parse(project_director),
            department,
            faculty,
            session,
            roll_no,
            cgpa_honours,
            supervisor: JSON.parse(supervisor),
            project_title: project_title,
            project_details: JSON.parse(project_details),
            total_budget,
            pdf_url_part_A: req.files['partA'] ? req.files['partA'][0].path : null,
            pdf_url_part_B: req.files['partB'] ? req.files['partB'][0].path : null
        });

        await proposal.save();
        res.status(201).json({ success: true, message: "Student proposal submitted successfully", proposal });

    } catch (error) {
        if (req.files['partA'] && req.files['partA'][0].path) fs.unlinkSync(req.files['partA'][0].path);
        if (req.files['partB'] && req.files['partB'][0].path) fs.unlinkSync(req.files['partB'][0].path);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

const updateProposal = async (req, res) => {
    try {
        const { proposal_id } = req.body;

        // Verification now done by middleware - token already verified
        // Access decoded token data from middleware
        const { proposal_id: token_proposal_id, request_id: token_request_id } = req.updateData;
        const request_id = token_request_id;

        // Double check IDs match token data
        if (proposal_id !== token_proposal_id.toString()) {
            // Delete any uploaded files
            if (req.files) {
                Object.values(req.files).flat().forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error(`Failed to delete file: ${file.path}`, err);
                    });
                });
            }
            return res.status(403).json({
                success: false,
                message: "Token doesn't match proposal or request"
            });
        }

        const updates = req.body.updates ? JSON.parse(req.body.updates) : {};

        // Check if the proposal exists
        const proposal = await StudentProposal.findById(proposal_id);
        if (!proposal) {
            return res.status(404).json({
                success: false,
                error: "Proposal not found"
            });
        }

        // Track uploaded files
        const uploadedFiles = [];

        // Function to handle file updates with safer checks - now inside updateProposal scope
        const updateFileField = (fieldName, existingPath) => {
            // First check if req.files exists and has the field
            if (req.files && req.files[fieldName] && req.files[fieldName].length > 0) {
                const filePath = req.files[fieldName][0].path;
                uploadedFiles.push(filePath);

                // Delete the old file if it exists
                if (existingPath) {
                    try {
                        fs.unlinkSync(existingPath); // Synchronous delete to ensure completion
                    } catch (err) {
                        console.error(`Failed to delete old file: ${existingPath}`, err);
                    }
                }

                return filePath;
            }
            return existingPath;
        };

        // Apply dynamic field updates
        Object.keys(updates).forEach((key) => {
            if (proposal[key] !== undefined) {
                proposal[key] = updates[key];
            }
        });

        // Handle file uploads (if any)
        proposal.pdf_url_part_A = updateFileField('partA', proposal.pdf_url_part_A);
        proposal.pdf_url_part_B = updateFileField('partB', proposal.pdf_url_part_B);

        // Save updated proposal
        const updatedProposal = await proposal.save();

        // Update request status if request_id is provided
        const request = await Request.findById(request_id);
        if (request) {
            request.status = 'updated';
            request.submitted_at = new Date();
            request.update_notes = updates.update_notes || 'Proposal updated successfully';
            await request.save();
        }

        res.status(200).json({
            success: true,
            message: "Proposal updated successfully",
            updatedProposal,
            requestUpdated: true
        });

    } catch (error) {
        console.error("Error updating proposal:", error);

        // If an error occurs, delete any newly uploaded files
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error(`Failed to delete file: ${file.path}`, err);
                });
            });
        }

        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

const getApprovedProposals = async (req, res, next) => {
    try {
        const studentProposals = await StudentProposal.find({ approval_status: 3 });
        req.student_proposals = studentProposals;
        next();
    } catch (error) {
        console.error("Error fetching proposals:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

module.exports = { submitProposal, updateProposal, getApprovedProposals };
