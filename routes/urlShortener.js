const router = require("express").Router()
const shortUrl = require("node-url-shortener")


router.post("/data", async (req, res) => {
    try {

        // shortUrl.short(req.body.url, (err, url) => {
        //     if (err) {
        //         console.log(err)
        //         return res.json({ msg: err, success: false })
        //     }
        //     return res.json({ msg: url, success: true })
        // })

        shortUrl.short(req.body.url, (err, url) => {
            if (err) {
                console.log(err)
            }
            return res.json({ msg: url, success: true })
        })

    }
    catch (err) {
        console.log(err)
    }

})

module.exports = router