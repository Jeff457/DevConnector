const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    text: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    name: {
        type: mongoose.Schema.Types.String,
    },
    avatar: {
        type: mongoose.Schema.Types.String,
    },
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
        },
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
            text: {
                type: mongoose.Schema.Types.String,
                required: true,
            },
            name: {
                type: mongoose.Schema.Types.String,
            },
            avatar: {
                type: mongoose.Schema.Types.String,
            },
            date: {
                type: mongoose.Schema.Types.Date,
                default: Date.now,
            },
        },
    ],
    date: {
        type: mongoose.Schema.Types.Date,
        default: Date.now,
    },
});

module.exports = Post = mongoose.model("post", PostSchema);