"use strict"

const router = require("express").Router()
const homeController = require("../controllers/homeController")


router.get("/:categoryId/new", homeController.threadNew, homeController.redirectView)
router.post("/:categoryId/create", homeController.threadCreate, homeController.redirectView)
// router.post("/:category/:thread/delete/:messageId", homeController.deleteMessage, homeController.redirectView)
router.get("/:categoryId/:threadId/new", homeController.messageNew, homeController.redirectView)
router.post("/:categoryId/:threadId/create", homeController.messageCreate, homeController.redirectView)
router.get("/:categoryId/:threadId", homeController.thread, homeController.redirectView)
router.get("/:categoryId", homeController.category, homeController.redirectView)
router.get("/", homeController.index, homeController.indexView)

module.exports = router
