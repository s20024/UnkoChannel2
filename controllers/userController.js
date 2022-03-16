"use strict"

const User = require("../models/user")
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
    index: (req, res, next) => {
        User.find()
            .then(users => {
                res.locals.users = users
                next()
            })
            .catch(error => {
                console.log(`Error fetching users: ${error.message}`)
                next(error)
            })
    },
    indexView: (req, res) => {
        res.render("users/index", {category: "", thread: ""})
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
    show: (req, res, next) => {
        const userId = req.params.id
        User.findById(userId)
            .then(user => {
                res.locals.user = user
                next()
            })
            .catch(error => {
                console.log(`Error fetching user by ID: ${error.message}`)
            })
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
        next()
    }

}
