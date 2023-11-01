const jwt = require("jsonwebtoken")
const { User } = require("../models")


function verifyToken(req, res, next) {
    try {
        const token = req.headers["authorization"]
        if (token) {
            jwt.verify(token, process.env.SECRET_KEY, async (err, decodedToken) => {
                if (err) {
                    return res.json({ message: "Access denied wrong token" })
                }
                else {
                    const data = await User.findById(decodedToken.userId).select("-__v -password")
                    if (data) {
                        req.user = data
                        next()
                    }
                    else {
                        return res.json({ message: "Access denied" })
                    }
                }
            })
        }
        else {
            return res.json({ message: "Access denied token not found" })
        }
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = verifyToken