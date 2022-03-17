"use strict"

const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const messageSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        delete: {
            type: Number,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        thread: {
            type: Schema.Types.ObjectId,
            ref: "Thread",
            required: true
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("Message", messageSchema)
