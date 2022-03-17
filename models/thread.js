"use strict"

const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const threadSchema = new Schema(
    {
        title: {
            type: String,
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
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("Thread", threadSchema)
