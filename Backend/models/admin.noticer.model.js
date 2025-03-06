const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminNoticerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: [3, 'Name must be at least 3 characters long'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, 'Email must be at least 5 characters long'],
        match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: String }
});

adminNoticerSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY_ADMIN, { expiresIn: '1h' });
    return token;
};

adminNoticerSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
adminNoticerSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const AdminNoticer = mongoose.model('AdminNoticer', adminNoticerSchema);

module.exports = AdminNoticer;