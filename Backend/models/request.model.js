const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    proposal_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Proposal' // Reference to your existing proposal model
    },
    proposal_type: {
        type: String,
        required: true,
        enum: ['student', 'teacher', 'extension'] // Adjust based on your proposal types
    },
    recipient_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipient_type'
    },
    recipient_type: {
        type: String,
        required: true,
        enum: ['Student', 'Teacher'] // The model to use for recipient_id
    },
    recipient_email: {
        type: String,
        required: true
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin'
    },
    message: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    submitted_at: {
        type: Date,
        default: null // When the recipient submits their updated proposal
    },
    status: {
        type: String,
        enum: ['sent', 'viewed', 'in_progress', 'completed', 'expired'],
        default: 'sent'
    },
    valid_until: {
        type: Date,
        required: true
    },
    update_notes: {
        type: String,
        default: null
    },
    notification_sent: {
        type: Boolean,
        default: false
    },
    evaluation_sheet_urls: [{
        reviewer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reviewer'
        },
        url: {
            type: String
        },
        reviewer_name: {
            type: String
        }
    }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Index for faster lookups
requestSchema.index({ proposal_id: 1 });
requestSchema.index({ recipient_id: 1, status: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ valid_until: 1 });
requestSchema.index({ recipient_email: 1 });

requestSchema.plugin(mongoosePaginate);

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;