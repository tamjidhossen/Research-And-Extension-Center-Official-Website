const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestQueueSchema = new Schema({
    request_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true
    },
    expire_time: {
        type: Date,
        default: function () {
            // Default expiration is 30 minutes from now
            const date = new Date();
            date.setMinutes(date.getMinutes() + 30);
            return date;
        }
    }
}, { timestamps: true });

// Define ALL indexes in one place for clarity
// This creates a unique index on request_id
requestQueueSchema.index({ request_id: 1 }, { unique: true });
// This creates the TTL index for auto-expiration
requestQueueSchema.index({ expire_time: 1 }, { expireAfterSeconds: 0 });

const RequestQueue = mongoose.model('RequestQueue', requestQueueSchema);
module.exports = RequestQueue;