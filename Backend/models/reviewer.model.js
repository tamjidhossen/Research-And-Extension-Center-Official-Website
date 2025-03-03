const mongoose = require("mongoose");

const reviewerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    address: { type: String, required: true },
}, { timestamps: true });

const Reviewer = mongoose.model("Reviewer", reviewerSchema);

module.exports = { Reviewer };
