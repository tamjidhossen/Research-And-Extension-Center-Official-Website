const mongoose = require('mongoose');

const proposalUpdateRequestSchema = new mongoose.Schema({
    proposal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proposal',
        required: true
    },
    requester_type: {
        type: String,
        enum: ['student', 'teacher'],
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    admin_response: {
        type: String
    }
}, { timestamps: true });

const ProposalUpdateRequest = mongoose.model('ProposalUpdateRequest', proposalUpdateRequestSchema);

module.exports = ProposalUpdateRequest;
