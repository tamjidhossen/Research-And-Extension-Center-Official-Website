const mongoose = require('mongoose');

const proposalDocumentSchema = new mongoose.Schema({
    fiscal_year: { type: String, required: true },

    student: {
        partA_url: {
            en: { type: String, required: true },
            bn: { type: String, required: true }
        },
        partB_url: {
            en: { type: String, required: true },
            bn: { type: String, required: true }
        }
    },

    teacher: {
        partA_url: {
            en: { type: String, required: true },
            bn: { type: String, required: true }
        },
        partB_url: {
            en: { type: String, required: true },
            bn: { type: String, required: true }
        }
    }

}, { timestamps: true });

const ProposalDocument = mongoose.model('ProposalDocument', proposalDocumentSchema);

module.exports = ProposalDocument;
