const router = require("express").Router()
const userRouter = require("./user")
const urlRouter = require("./urlShortener")

router.use("/user", userRouter)
router.use("/url", urlRouter)

module.exports = router