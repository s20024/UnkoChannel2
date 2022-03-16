"use strict"

const Category = require("../models/category")
const threadSchema = require("../schemas/threadSchema")
const messageSchema = require("../schemas/messageSchema")
const mongoose = require("mongoose")

module.exports = {
    index: (req, res, next) => {
        Category.find({})
            .then(categorys => {
                res.locals.categorys = categorys
                next()
            })
            .catch(error => {next(error)})
    },
    indexView: (req, res) => {
        res.render("index", {category: "", thread: ""})
    },
    category: (req, res, next) => {
        const selectCategory = req.params.category
        Category.findOne({ title:selectCategory })
            .then(category => {
                if(category) {
                    res.locals.category = category.title
                    const Thread = mongoose.model(selectCategory, threadSchema)
                    Thread.find({ category: category.title })
                        .then(threads => {
                            res.locals.threads = threads
                            res.render("category", {category: selectCategory, thread: ""})
                        })
                } else {
                    res.locals.redirect = "/"
                    next()
                }
            })
            .catch(error => {
                console.log("error")
                next(error)
            })
    },
    threadNew: (req, res) => {
        const selectCategory = req.params.category
        res.locals.category = selectCategory
        res.render("threadNew", {thread: "", message: "Create new Thread"})
    },
    threadCreate: (req, res, next) => {
        const viewName = req.body.viewName
        const threadParams = {
            title: req.body.title,
            user: req.body.creater
        }
        const Message = mongoose.model(`${req.params.category}-${req.body.title}`, messageSchema)
        const messageAttributes = {
            content: req.body.fmessage,
            userName: viewName,
            user: req.body.creater,
            delete: 0
        }
        const m = new Message(messageAttributes)
        m.save()
        const Thread = mongoose.model(req.params.category, threadSchema)
        Thread.create(threadParams)
            .then(() => {
                console.log("Create new category")
                res.locals.redirect = `/${req.params.category}`
                next()
            })
            .catch(error => {
                // res.locals.redirect = `/${req.params.category}/new`
                res.locals.message = "That Title is already used!"
                const selectCategory = req.params.category
                res.locals.category = selectCategory
                // next()
                res.render("threadNew")
            })
    },
    thread: (req, res, next) => {
        const selectCategory = req.params.category
        const selectThread = req.params.thread
        Category.findOne({ title:selectCategory })
            .then(category => {
                if(category) {
                    const Thread = mongoose.model(selectCategory, threadSchema)
                    Thread.findOne({ title: selectThread })
                        .then(thread => {
                            if (thread) {
                                res.locals.category = selectCategory
                                res.locals.thread = selectThread
                                res.locals.threadCreater = thread.user
                                res.locals.redirect = `/${selectCategory}/${selectThread}`
                                res.render("thread", {category: selectCategory, thread: selectThread})
                            } else {
                                res.locals.redirect = `/${req.params.category}`
                                next()
                            }
                        })
                } else {
                    res.locals.redirect = "/"
                    next()
                }
            })
            .catch(error => {
                console.log("error")
                next(error)
            })
    },

    deleteMessage: (req, res, next) => {
        if (!req.user) {
            res.locals.redirect = "/"
            next()
        }
        const userId = req.user._id
        const messageId = req.params.messageId
        const Thread = mongoose.model(req.params.category, threadSchema)
        const Message = mongoose.model(`${req.params.category}-${req.params.thread}`, messageSchema)
        let deleteNum = 0

        Thread.findOne({ title: req.params.thread, user: userId })
            .then(thread => {
                if (thread) {
                    deleteNum = 1
                }
                Message.findOne({ _id: messageId, user: userId})
                    .then(message => {
                        if (message) {
                            deleteNum = 2
                        }
                        const messageParams = {
                            content: "",
                            delete: deleteNum
                        }

                        Message.findByIdAndUpdate(messageId, {
                            $set: messageParams
                        })
                            .then(() => {
                                res.locals.redirect = `/${req.params.category}/${req.params.thread}`
                                next()
                            })
                            .catch(error => {
                                next(error)
                            })
                    })
            })
    },

    redirectView: (req, res, next) => {
        const redirectPath = res.locals.redirect
        if (redirectPath !== undefined) res.redirect(redirectPath)
        else next()
    }
}
