const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    reviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Reviewer", required: true },
    fiscal_year: { type: String, required: true },
    invoice_url: { type: String, required: true },
    status: { type: Number, required: true }
}, { timestamps: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = { Invoice };
