const mongoose = require('mongoose');

const proposalDocumentSchema = new mongoose.Schema({
    fiscal_year: { type: String, required: true },
    registrationOpen: { type: Boolean, default: false },
    student: {
        partA_url: {
            en: { type: String, required: true, default: "" },
            bn: { type: String, required: true, default: "" }
        },
        partB_url: {
            en: { type: String, required: true, default: "" },
            bn: { type: String, required: true, default: "" }
        }
    },

    teacher: {
        partA_url: {
            en: { type: String, required: true, default: "" },
            bn: { type: String, required: true, default: "" }
        },
        partB_url: {
            en: { type: String, required: true, default: "" },
            bn: { type: String, required: true, default: "" }
        }
    },
    proposal_mark_sheet: { type: String, required: true, default: "" }
}, { timestamps: true });

const ProposalDocument = mongoose.model('ProposalDocument', proposalDocumentSchema);

module.exports = ProposalDocument;
