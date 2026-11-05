const mongoose = require("mongoose");

const ReceiptSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    time: {
        type: String,
        default: () => new Date().toISOString()
    }
}, { _id: false });

const MessageSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    text: String,

    time: String,

    // Delivered receipts
    deliveredTo: {
        type: [ReceiptSchema],
        default: []
    },

    // Seen usernames (backward compatibility)
    seenBy: {
        type: [String],
        default: []
    },

    // Seen timestamps
    seenAt: {
        type: [ReceiptSchema],
        default: []
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Message", MessageSchema);
