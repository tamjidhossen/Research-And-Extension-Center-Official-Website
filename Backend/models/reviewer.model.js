const mongoose = require("mongoose");

const reviewerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    designation: { type: String, default: "" },
    department: { type: String, default: "" },
    address: { type: String, default: "" },
}, { timestamps: true });

const Reviewer = mongoose.model("Reviewer", reviewerSchema);

module.exports = { Reviewer };
