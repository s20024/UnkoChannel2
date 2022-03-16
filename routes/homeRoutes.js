"use strict"

const router = require("express").Router()
const homeController = require("../controllers/homeController")


router.get("/:category/new", homeController.threadNew)
router.post("/:category/create", homeController.threadCreate, homeController.redirectView)
router.post("/:category/:thread/delete/:messageId", homeController.deleteMessage, homeController.redirectView)
router.get("/:category/:thread", homeController.thread, homeController.redirectView)
router.get("/:category", homeController.category, homeController.redirectView)
router.get("/", homeController.index, homeController.indexView)

module.exports = router
