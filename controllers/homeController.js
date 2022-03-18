"use strict"

const Category = require("../models/category")
const Thread = require("../models/thread")
const Message = require("../models/message")

module.exports = {
    index: (req, res) => {
        Category.find({})
            .then(categories => {
                res.locals.categories = categories
                res.render("index", {category: "", thread: ""})
            })
            .catch(() => {
                console.log("error homeController->index->Category.find")
                res.render("error", {message: "なんらかのエラーが発生しました。"})
            })
    },
    category: (req, res, next) => {
        const categoryId = req.params.categoryId
        Category.findOne({_id: categoryId})
            .then(category => {
                if (category) {
                    res.locals.category = category
                    Thread.find({category: category._id})
                        .sort({updatedAt: -1})
                        .then(threads => {
                            res.locals.threads = threads
                            res.render("category", {thread: ""})
                        })
                        .catch(() => {
                            console.log("error homeController->category->Thread.find")
                            res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
                        })
                } else {
                    res.locals.redirect = "/"
                    next()
                }
            })
            .catch(() => {
                console.log("error homeController->category->Category.findOne")
                res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
            })
    },
    threadNoOption: (req, res, next) => {
        const categoryId = req.params.categoryId
        const threadId = req.params.threadId
        res.locals.redirect = `/${categoryId}/${threadId}/all`
        next()
    },
    thread: (req, res, next) => {
        const categoryId = req.params.categoryId
        const threadId = req.params.threadId
        const option = req.params.option

        if (option !== "all" && isNaN(option)) {
            res.locals.redirect = `/${categoryId}/${threadId}/all`
            next()
        }

        Category.findOne({_id: categoryId})
            .then(category => {
                if (category) {
                    Thread.findOne({ _id: threadId})
                        .then(thread => {
                            if (thread) {
                                Message.find({thread: threadId})
                                    .then(messages => {
                                        if (option === "all") {
                                            res.render("thread", {category: category, thread: thread, messages: messages})
                                        } else {
                                            const optionNum = parseInt(option)
                                            if (optionNum < thread.message) {
                                                res.render("thread", {category: category, thread: thread, messages: messages.slice(thread.message - optionNum)})
                                            } else {
                                                res.render("thread", {category: category, thread: thread, messages: messages})
                                            }
                                        }
                                    })
                                    .catch(() => {
                                        console.log("error homeController->thread->Message.find")
                                        res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
                                    })
                            } else {
                                res.locals.redirect = "/"
                                next()
                            }
                        })
                        .catch(() => {
                            console.log(`error for homeController->thread->Thread.findOne`)
                            res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
                        })
                } else {
                    res.locals.redirect = "/"
                    next()
                }
            })
            .catch(() => {
                console.log("error homeController->thread->Category.find")
                res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
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
            .catch(() => {
                console.log("error homeController->threadNew->Category.findOne")
                res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
            })
    },
    threadCreate: (req, res, next) => {
        const viewName = req.body.viewName
        const categoryId = req.params.categoryId
        const threadParams = {
            title: req.body.title,
            user: req.body.creater,
            category: categoryId,
            message: 1
        }
        Thread.create(threadParams)
            .then(thread => {
                if (thread) {
                    const messageParams = {
                        content: req.body.fmessage,
                        userName: viewName,
                        user: req.body.creater,
                        number: 1,
                        delete: 0,
                        category: thread.category,
                        thread: thread._id
                    }
                    Message.create(messageParams)
                        .then(()=> {
                            res.locals.redirect = `/${categoryId}`
                            next()
                        })
                        .catch(() => {
                            console.log("error homeController->threadCreate->Message.create")
                            res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
                        })
                } else {
                    res.locals.redirect = `/${categoryId}`
                    next()
                }
            })
            .catch(() => {
                console.log("error homeController->threadCreate->Thread.create")
                res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
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
                        .catch(() => {
                            console.log("error homeController->messageNew->Thread.findOne")
                            res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
                        })
                } else {
                    res.locals.redirect = "/"
                    next()
                }
            })
            .catch(() => {
                console.log("error homeController->messageNew->Category.findOne")
                res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
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
                    number: thread.message + 1,
                    category: thread.category,
                    thread: thread._id
                }
                Message.create(messageParams)
                    .then(()=> {
                        const threadUpdateParams = {
                            message: thread.message + 1
                        }
                        Thread.findByIdAndUpdate(threadId, {$set: threadUpdateParams})
                            .then(() => {
                                res.locals.redirect = `/${categoryId}/${threadId}`
                                next()
                            })
                            .catch(() => {
                                console.log("error homeController->messageCreate->Thread.findByIdAndUpdate")
                                res.render("error", {message: "スレッドをアップデートできませんでした。", category: "", thread: ""})
                            })
                    })
                    .catch(() => {
                        console.log("error homeController->messageCreate->Message.create")
                        res.render("error", {message: "メッセージを作成することができませんでした。", category: "", thread: ""})
                    })
            })
            .catch(() => {
                console.log("error homeController->messageCreate->Thread.findOne")
                res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
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
                                        .catch(() => {
                                            console.log("error homeController->messageDelete->Message.findByIdAndUpdate")
                                            res.render("error", {message: "メッセージを削除できませんでした。", category: "", thread: ""})
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
                        .catch(() => {
                            console.log("error homeController->messageDelete->Message.findOne")
                            res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
                        })
                } else {
                    res.locals.redirect = `/${categoryId}`
                    next()
                }
            })
            .catch(() => {
                console.log("error homeController->messageDelete->Thread.findOne")
                res.render("error", {message: "Urlが間違ってると思われます。", category: "", thread: ""})
            })
    },
    redirectView: (req, res, next) => {
        const redirectPath = res.locals.redirect
        if (redirectPath !== undefined) res.redirect(redirectPath)
        else next()
    }
}