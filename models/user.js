"use strict"

const mongoose = require("mongoose")
const { Schema } = mongoose
const passportLocalMongoose = require("passport-local-mongoose")
const userSchema = new Schema(
    {
        loginId: {
            type: String,
            unique: true
        },
        viewName: {
            type: String,
            unique: true
        }
    },
    {
        timestamps: true
    }
)

userSchema.virtual("name").get(function() {
    return `${this.viewName}`
})

userSchema.plugin(passportLocalMongoose, {
    usernameField: "loginId"
})

module.exports = mongoose.model("user", userSchema)
