"use strict"

const router = require("express").Router()
const usersController = require("../controllers/userController")

router.get("/", usersController.index)
router.get("/userPage/:userId", usersController.userPage)
router.delete("/delete/:userId", usersController.delete, usersController.redirectView)
router.get("/new", usersController.new)
router.post(
    "/create",
    usersController.validate,
    usersController.create,
    usersController.authenticate,
    usersController.setLoginRedirect,
    usersController.redirectView
)
router.get("/login", usersController.login)
router.post(
    "/login",
    usersController.authenticate,
    usersController.setLoginRedirect,
    usersController.redirectView
)
router.get("/logout", usersController.logout, usersController.redirectView)

module.exports = router
