const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    files: [{ name: { type: String }, url: { type: String } }],
    link: { type: String, default: "" },
}, { timestamps: true });

const Notice = mongoose.model("Notice", noticeSchema);

module.exports = Notice;
