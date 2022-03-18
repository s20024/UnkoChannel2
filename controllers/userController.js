"use strict"

const User = require("../models/user")
const Thread = require("../models/thread")
const Message = require("../models/message")
const passport = require("passport")
const { check, sanitizeBody, validationResult } = require("express-validator")
const getUserParams = body => {
    return {
        loginId: body.loginId,
        viewName: body.viewName,
        password: body.password
    }
}


module.exports = {
    index: (req, res) => {
        User.find()
            .then(users => {
                res.render("users/index", {category: "", thread: "", users: users})
            })
            .catch(() => {
                console.log("error userController->index->User.find")
                res.render("error", {message: "Urlが間違っています。", category: "", thread: ""})
            })
    },
    userPage: (req, res) => {
        const userId = req.params.userId
        User.findOne({_id: userId})
            .then(user => {
                if (user) {
                    Message.find({user: userId})
                        .sort({createdAt: 1})
                        .then(messages => {
                            if (messages.length === 0) {
                                res.render("users/userPage", {category: "", thread: "", threads: [], user: user})
                                return
                            }
                            const threadIds = []
                            messages.forEach((message) => {
                                const threadId = message.thread
                                if (!threadIds.includes(threadId)) {
                                    threadIds.push({"_id": threadId})
                                }
                            })
                            Thread.find({$or: threadIds})
                                .sort({createdAt: -1})
                                .then((threads) => {
                                    res.render("users/userPage", {category: "", thread: "", threads: threads, user: user})
                                })
                                .catch(() =>{
                                    console.log("error userController->userPage->Thread.findOne")
                                    res.render("error", {message: "まだ一つもメッセージを投稿していません。", category: "", thread: ""})
                                })
                        })
                        .catch(() => {
                            console.log("error userController->userPage->Message.find")
                            res.render("error", {message: "Urlが間違っています。", category: "", thread: ""})
                        })
                } else {
                    res.render("error", {message: "そのようなユーザーはおりません。", category: "", thread: ""})
                }
            })
            .catch(() => {
                console.log("error userController->userPage->User.findOne")
                res.render("error", {message: "Urlが間違っています。", category: "", thread: ""})
            })
    },
    new: (req, res) => {
        res.locals.fromCategory = req.query.category || ""
        res.locals.fromThread = req.query.thread || ""
        res.render("users/new", {category: "", thread: "", message: "Create Account"})
    },
    create: (req, res, next) => {
        if (req.skip) return next()
        const newUser = new User(getUserParams(req.body))
        User.register(newUser, req.body.password, (error, user) => {
            if (user) {
                next()
            } else {
                res.render("users/new", {fromCategory: "", fromThread: "", category: "", thread: "", message: "This loginId or This viewName are already used some user!"})
            }
        })
    },
    redirectView: (req, res, next) => {
        const redirectPath = res.locals.redirect
        if (redirectPath) res.redirect(redirectPath)
        else next()
    },
    login: (req, res) => {
        res.locals.fromCategory = req.query.category || ""
        res.locals.fromThread = req.query.thread || ""
        res.render("users/login", {category: "", thread: ""})
    },
    authenticate: passport.authenticate("local", {
        failureRedirect: "/users/login"
    }),

    setLoginRedirect: (req, res, next) => {
        const fromCategory = (req.body.fromCategory)? `${req.body.fromCategory}/` : ""
        const fromThread = req.body.fromThread || ""
        res.locals.redirect = `/${fromCategory}${fromThread}`
        next()
    },

    validate: (req, res, next) => {
        sanitizeBody("loginId")
            .trim()
        check("password", "Password cannot be empty").notEmpty()

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.skip = true
            req.flash("error", messages.json(" and "))
            res.locals.redirect = "/users/new"
            next()
        } else {
            next()
        }
    },
    logout: (req, res, next) => {
        req.logout()
        req.flash("success", "You have been logged out!")
        res.locals.redirect = "/"
        next()
    },
    delete: (req, res, next) => {
        const userId = req.params.userId
        if (!req.user || req.user._id !== userId) {
            res.locals.redirect = "/users"
            next()
        }
        User.findByIdAndRemove(userId)
            .then(() => {
                res.locals.redirect = "/users"
                next()
            })
            .catch(() => {
                console.log("error userController->delete->User.findByIdAndRemove")
                res.render("error", {message: "UserIdが間違っています。", category: "", thread: ""})
            })
    }
}
