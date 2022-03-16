"use strict"

const router = require("express").Router()
const homeRoutes = require("./homeRoutes")
const userRoutes = require("./userroutes")
const errorRouters = require("./errorRoutes")

router.use("/users", userRoutes)
router.use("/", homeRoutes)
router.use("/", errorRouters)

module.exports = router
