const Request = require('../models/request.model.js');
const { StudentProposal } = require('../models/student.proposal.model.js');
const { TeacherProposal } = require('../models/teacher.proposal.model.js');
const { ReviewerAssignment } = require('../models/reviewer.assignment.model.js');
const RequestQueueModel = require('../models/request.queue.model.js');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Email configuration
const { sendUpdateRequestEmail } = require('../config/emailConfig.js');

// Create and send a request
const createRequest = async (req, res) => {
    try {
        let {
            proposal_id,
            proposal_type,
            message,
            expiry_days
        } = req.body;
        proposal_id = new mongoose.Types.ObjectId(proposal_id); // Ensure proposal_id is a valid ObjectId
        // Validate inputs
        if (!proposal_id || !proposal_type || !expiry_days) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Check if proposal exists
        let proposal;
        if (proposal_type === 'student') {
            proposal = await StudentProposal.findById(proposal_id);
        } else if (proposal_type === 'teacher') {
            proposal = await TeacherProposal.findById(proposal_id);
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid proposal type"
            });
        }

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Proposal not found"
            });
        }
        let recipient_email = proposal.project_director.email;

        // Calculate expiry date
        const valid_until = new Date();
        valid_until.setDate(valid_until.getDate() + parseInt(expiry_days));

        // Get evaluation sheets from reviewers
        let evaluation_sheet_urls = [];
        // Try to find reviewer evaluation sheets
        const reviewerAssignments = await ReviewerAssignment.find({
            proposal_id: proposal_id,
            proposal_type: proposal_type,
            status: 1 // Completed reviews
        }).populate('reviewer_id', 'name email');
        if (reviewerAssignments && reviewerAssignments.length > 0) {
            // Get all available evaluation sheets from reviewers
            evaluation_sheet_urls = reviewerAssignments
                .filter(assignment => assignment.evaluation_sheet_url)
                .map(assignment => ({
                    reviewer_id: assignment.reviewer_id._id,
                    url: assignment.evaluation_sheet_url,
                    reviewer_name: assignment.reviewer_id.name || 'Anonymous Reviewer'
                }));
        }
        recipient_email = proposal.project_director.email;
        // Create request
        const request = new Request({
            proposal_id,
            proposal_type,
            recipient_email,
            admin_id: req.user._id,
            message,
            valid_until,
            evaluation_sheet_urls
        });

        await request.save();

        // Generate JWT token for secure access
        const token = jwt.sign(
            { request_id: request._id },
            process.env.SECRET_KEY_UPDATE_REQUEST,
            { expiresIn: `${expiry_days}d` }
        );

        // Create update link
        const baseUrl = process.env.FRONTEND_BASE_URL;
        const updateLink = `${baseUrl}/update-request?token=${token}`;

        // Send email
        await sendUpdateRequestEmail(
            recipient_email,
            proposal.project_title,
            message,
            updateLink,
            expiry_days,
            evaluation_sheet_urls
        );

        res.status(201).json({
            success: true,
            message: "Request sent successfully",
            request,
            updateLink
        });

    } catch (error) {
        console.error("Create request error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get all requests (no filters, no pagination)
const getAllRequests = async (req, res) => {
    try {
        // Get all requests without any filters
        const requests = await Request.find()
            .sort({ created_at: -1 })
            .populate('proposal_id', 'project_title project_director')
            .populate('admin_id', 'name email');

        res.status(200).json({
            success: true,
            count: requests.length,
            requests: requests
        });
    } catch (error) {
        console.error("Get requests error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get request by ID
const getRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findById(id)
            .populate('proposal_id', 'project_title project_director')
            .populate('admin_id', 'name email');

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.status(200).json({ success: true, request });
    } catch (error) {
        console.error("Get request error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Verify request token (public route)
const verifyRequestToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(
                token,
                process.env.SECRET_KEY_UPDATE_REQUEST
            );
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        // Find request
        const request = await Request.findById(decoded.request_id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        // Check if expired and delete if it is
        if (new Date() > new Date(request.valid_until)) {
            // Delete the expired request
            await Request.findByIdAndDelete(request._id);
            return res.status(400).json({
                success: false,
                message: "Request has expired!",
                expired: true
            });
        }

        // If status is sent, update to viewed
        if (request.status === 'sent') {
            request.status = 'viewed';
            await request.save();
        }

        // Get proposal details
        let proposal;
        if (request.proposal_type === 'student') {
            proposal = await StudentProposal.findById(request.proposal_id);
        } else {
            proposal = await TeacherProposal.findById(request.proposal_id);
        }

        // Filter out sensitive or unnecessary fields
        const filteredProposal = proposal.toObject();

        // Fields to remove from frontend response
        const fieldsToRemove = [
            'status',
            'reviewer',
            'createdAt',
            'approval_status',
            'reviewer_avg_mark',
            '__v',
            'updatedAt',
            'approval_budget',
        ];

        // Remove each field from the proposal object
        fieldsToRemove.forEach(field => {
            if (filteredProposal.hasOwnProperty(field)) {
                delete filteredProposal[field];
            }
        });

        // ===== Add to queue management =====
        // Import the queue controller
        const queueController = require('../controllers/request.queue.controller.js');

        try {
            // Check if request is already in queue
            const inQueue = await queueController.checkInQueue(request._id);

            // If already in queue, remove it first
            if (inQueue) {
                await queueController.removeFromQueue(request._id);
            }

            // Add to queue with fresh expiration time
            await queueController.addToQueue(request._id);
        } catch (queueError) {
            console.error("Queue management error:", queueError);
            // Continue even if queue management fails
        }
        const queueEntry = await RequestQueueModel.findOne({ request_id: request._id });
        res.status(200).json({
            success: true,
            message: "Token valid",
            request_id: request._id,
            expire_time: queueEntry ? queueEntry.expire_time : null,
            proposal: filteredProposal
        });
    } catch (error) {
        console.error("Verify token error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update request status
const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, update_notes } = req.body;

        if (!['viewed', 'in_progress', 'completed', 'expired'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const request = await Request.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        request.status = status;
        if (update_notes) request.update_notes = update_notes;
        if (status === 'completed') request.submitted_at = new Date();

        await request.save();

        res.status(200).json({ success: true, message: "Status updated", request });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Submit proposal update
const submitRequestResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { update_notes } = req.body;

        const request = await Request.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        // Check if expired
        if (new Date() > new Date(request.valid_until)) {
            return res.status(400).json({ success: false, message: "Request has expired" });
        }

        // Handle file uploads if present
        if (req.files) {
            let proposalModel;
            if (request.proposal_type === 'student') {
                proposalModel = StudentProposal;
            } else {
                proposalModel = TeacherProposal;
            }

            const proposal = await proposalModel.findById(request.proposal_id);
            if (!proposal) {
                return res.status(404).json({ success: false, message: "Proposal not found" });
            }

            // Update PDF files if uploaded
            if (req.files.partA) {
                // Delete old file
                if (proposal.pdf_url_part_A) {
                    const oldPath = path.join(__dirname, '..', proposal.pdf_url_part_A);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
                proposal.pdf_url_part_A = req.files.partA[0].path;
            }

            if (req.files.partB) {
                // Delete old file
                if (proposal.pdf_url_part_B) {
                    const oldPath = path.join(__dirname, '..', proposal.pdf_url_part_B);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
                proposal.pdf_url_part_B = req.files.partB[0].path;
            }

            // Update other fields from the request body
            if (req.body.updates) {
                const updates = JSON.parse(req.body.updates);
                Object.keys(updates).forEach(key => {
                    if (proposal[key] !== undefined) {
                        proposal[key] = updates[key];
                    }
                });
            }

            await proposal.save();
        }

        // Update request status
        request.status = 'completed';
        request.submitted_at = new Date();
        if (update_notes) request.update_notes = update_notes;

        await request.save();

        res.status(200).json({
            success: true,
            message: "Response submitted successfully",
            request
        });
    } catch (error) {
        console.error("Submit response error:", error);

        // Delete uploaded files if an error occurs
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) console.error(`Failed to delete file: ${file.path}`, err);
                });
            });
        }

        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete a request
const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        await Request.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Request deleted successfully" });
    } catch (error) {
        console.error("Delete request error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    createRequest,
    getAllRequests,
    getRequestById,
    verifyRequestToken,
    updateRequestStatus,
    submitRequestResponse,
    deleteRequest
};