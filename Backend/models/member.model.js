const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    rec_designation: {
        type: String,
        required: true,
    },
    profile_picture_url: {
        type: String,
        required: true
    },
    profile_view_url: {
        type: String,
        required: true
    },
    seniority: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
