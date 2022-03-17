"use strict"

const Category = require("../models/category")
const Thread = require("../models/thread")
const Message = require("../models/message")

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
        const categoryId = req.params.categoryId
        Category.findOne({_id: categoryId})
            .then(category => {
                if (category) {
                    res.locals.category = category
                    Thread.find({category: category._id})
                        .then(threads => {
                            res.locals.threads = threads
                            res.render("category", {thread: ""})
                        })
                        .catch(error => {throw(error)})
                } else {
                    res.locals.redirect = "/"
                    next()
                }
            })
    },
    thread: (req, res, next) => {
        const categoryId = req.params.categoryId
        const threadId = req.params.threadId

        Category.findOne({_id: categoryId})
            .then(category => {
                if (category) {
                    Thread.findOne({ _id: threadId})
                        .then(thread => {
                            if (thread) {
                                Message.find({thread: threadId})
                                    .then(messages => {
                                        res.render("thread", {category: category, thread: thread, messages: messages})
                                    })
                                    .catch(error => {
                                        console.log("error homeController->thread->Message.find")
                                        throw error
                                    })
                            } else {
                                res.locals.redirect = "/"
                                next()
                            }
                        })
                        .catch(error => {
                            console.log(`error for homeController->thread->Thread.findOne`)
                            throw(error)
                        })
                } else {
                    res.locals.redirect = "/"
                    next()
                }
            })
            .catch(error => {
                console.log("error homeController->thread->Category.find")
                throw error
            })
    },
    threadNew: (req, res, next) => {
        const categoryId = req.params.categoryId
        Category.findOne({_id: categoryId})
            .then(category => {
                if (category) {
                    res.render("threadNew", {category: category, thread: "", message: "Create new Thread"})
                } else {
                    res.locals.redirect = "/"
                    next()
                }
            })
            .catch(error => {
                console.log("error homeController->threadNew->Category.findOne")
                throw error
            })
    },
    threadCreate: (req, res, next) => {
        const viewName = req.body.viewName
        const categoryId = req.params.categoryId
        const threadParams = {
            title: req.body.title,
            user: req.body.creater,
            category: categoryId
        }
        Thread.create(threadParams)
            .then(thread => {
                if (thread) {
                    const messageParams = {
                        content: req.body.fmessage,
                        userName: viewName,
                        user: req.body.creater,
                        delete: 0,
                        category: thread.category,
                        thread: thread._id
                    }
                    Message.create(messageParams)
                        .then((message)=> {
                            if (message) {
                                res.locals.redirect = `/${categoryId}/${thread._id}`
                                next()
                            } else {
                                res.locals.redirect = `/${categoryId}`
                                next()
                            }
                        })
                        .catch(error => {
                            console.log("error homeController->threadCreate->Message.create")
                            throw error
                        })
                } else {
                    res.locals.redirect = `/${categoryId}`
                    next()
                }
            })
            .catch(error => {
                console.log("error homeController->threadCreate->Thread.create")
                throw error
            })
    },
    messageNew: (req, res, next) => {
        const categoryId = req.params.categoryId
        const threadId = req.params.threadId
        Category.findOne({_id: categoryId})
            .then(category => {
                if (category) {
                    Thread.findOne({_id: threadId})
                        .then(thread => {
                            if (thread) {
                                res.render("messageNew", {category: category, thread: thread})
                            } else {
                                res.locals.redirect = `/${categoryId}`
                                next()
                            }
                        })
                        .catch(error => {
                            console.log("error homeController->messageNew->Thread.findOne")
                            throw error
                        })
                } else {
                    res.locals.redirect = "/"
                    next()
                }
            })
            .catch(error => {
                console.log("error homeController->messageNew->Category.findOne")
                throw error
            })
    },
    messageCreate: (req, res, next) => {
        const categoryId = req.params.categoryId
        const threadId = req.params.threadId
        Thread.findOne({_id: threadId})
            .then(thread => {
                const messageParams = {
                    content: req.body.content,
                    userName: req.body.userName,
                    user: req.body.userId,
                    delete: 0,
                    category: thread.category,
                    thread: thread._id
                }
                Message.create(messageParams)
                    .then(()=> {
                        res.locals.redirect = `/${categoryId}/${threadId}`
                        next()
                    })
                    .catch(error => {
                        console.log("error homeController->messageCreate->Message.create")
                        throw error
                    })
            })
            .catch(error => {
                console.log("error homeController->messageCreate->Thread.findOne")
                throw error
            })
    },
    messageDelete: (req, res, next) => {
        if (!req.user) {
            res.locals.redirect = "/"
            next()
        }

        const categoryId = req.params.categoryId
        const threadId = req.params.threadId
        const userId = req.user._id
        const messageId = req.params.messageId

        Thread.findOne({_id: threadId})
            .then(thread => {
                if (thread) {
                    Message.findOne({_id: messageId})
                        .then(message => {
                            if (message) {
                                // ここの比較式？がなんとなく汚いです。toStringで無理やり感満載ですね；；
                                // これって普通こんな感じなんですか？もっと他のやり方があるんですか？、、、勉強不足です。。
                                // toStringではなくて、toHexStringの方が正しいのかな？ParseIntがいいのかな？w、、、わかんないw
                                if (thread.user.toString() === userId.toString() || message.user.toString() === userId.toString()) {
                                    const deleteNum = (message.user.toString() === userId.toString())? 2: 1
                                    const messageParams = {
                                        content: "",
                                        delete: deleteNum
                                    }

                                    Message.findByIdAndUpdate(messageId,{$set: messageParams})
                                        .then(() => {
                                            res.locals.redirect = `/${categoryId}/${threadId}`
                                            next()
                                        })
                                        .catch(error => {
                                            console.log("error homeController->messageDelete->Message.findByIdAndUpdate")
                                            throw error
                                        })
                                } else {
                                    res.locals.redirect = `/${categoryId}/${threadId}`
                                    next()
                                }
                            } else {
                                res.locals.redirect = `/${categoryId}/${threadId}`
                                next()
                            }
                        })
                        .catch(error => {
                            console.log("error homeController->messageDelete->Message.findOne")
                            throw error
                        })
                } else {
                    res.locals.redirect = `/${categoryId}`
                    next()
                }
            })
            .catch(error => {
                console.log("error homeController->messageDelete->Thread.findOne")
                throw error
            })
    },
    redirectView: (req, res, next) => {
        const redirectPath = res.locals.redirect
        if (redirectPath !== undefined) res.redirect(redirectPath)
        else next()
    }
}

/*
module.exports = {
    deleteMessage: (req, res, next) => {
        if (!req.user) {
            res.locals.redirect = "/"
            next()
        }
        const userId = req.user._id
        const messageId = req.params.messageId
        let deleteNum = 0

        Thread.findOne({ _id: req.params.thread, user: userId })
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

}
*/