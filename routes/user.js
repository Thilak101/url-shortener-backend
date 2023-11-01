const router = require("express").Router()
const bcrypt = require("bcrypt")
const { User } = require("../models")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const verifyToken = require("../middlewares/verifyToken")

router.get("/", (req, res) => {
    return res.json({ msg: "from user route" })
})

router.post("/signup", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(req.body.password, salt)
        const user = await User.create({
            email: req.body.email,
            password: passwordHash
        })
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            debug: true,
            auth: {
                user: "nanuthilak000@gmail.com",
                pass: process.env.MAIL_PASS
            }
        })
        let info = await transporter.sendMail({
            from: "URL-SHORTENER-APPLICATION",
            to: req.body.email,
            subject: "Verify Your Email - URL-SHORTENER",
            html: `
        <div>
        <strong>
        ${req.body.email}
        </strong>, We welcome to our platform.
        <a style="background-color:yellow; color:blue;" href="https://harmonious-queijadas-949af8.netlify.app/user/verify/${token}">Click to Verify</a>
       <div>
        <p>Thanks and Regards</p>
        <p>From URL-Shortener Team</p>
        </div>
        </div>
        `
        })
        return res.json({
            info,
            msg: "Account created successfully, Please check your e-mail and verify your account to login",
            success: true
        })
    }
    catch (err) {
        console.log(err)
    }
})


router.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body
        const result = await User.findOne({ email: email })
        if (result) {
            if (result.verify) {
                bcrypt.compare(password, result.password).then((passwordResult) => {
                    if (passwordResult) {
                        jwt.sign({ userId: result._id }, process.env.SECRET_KEY, (err, token) => {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                return res.json({
                                    success: true,
                                    msg: "Login Successful",
                                    token
                                })
                            }
                        })
                    }
                    else {
                        return res.json({ success: false, msg: "Incorrect password" })
                    }
                })
            }
            else {
                return res.json({ success: false, msg: "Please verify your email" })
            }
        }
        else {
            return res.json({ success: false, msg: "User not registered" })
        }
    }
    catch (err) {
        console.log(err)
    }
})


router.get("/data", verifyToken, (req, res) => {
    try {
        return res.json(req.user)

    }
    catch (err) {
        console.log(err)
    }
})

router.get("/verify/:token", (req, res) => {
    try {
        jwt.verify(req.params.token, process.env.SECRET_KEY, async (err, decoded) => {
            if (err) {
                return res.json({ msg: "Link expired", success: false })
            }
            const id = decoded.id
            await User.findByIdAndUpdate(id, { verify: true })
            return res.json({ msg: "Account verified successfully.", success: true })
        })
    }
    catch (err) {
        console.log(err)
    }

})


router.post("/forgot-password", (req, res) => {
    try {
        const { email } = req.body
        User.findOne({ email: email }).then(user => {
            if (!user) {
                return res.send({ status: "User not existed" })
            }

            const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "10m" })
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "nanuthilak000@gmail.com",
                    pass: process.env.MAIL_PASS
                }
            })
            const mailOptions = {
                form: "from: URL-SHORTENER-APPLICATION",
                to: email,
                subject: "Reset Your Password",
                html: `<a href="https://harmonious-queijadas-949af8.netlify.app/reset-password/${token}"><b>Reset Password</b></a>`

            }
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error)
                    return
                }
                else {
                    console.log(info)
                    return res.json({ success: true })
                }
            })
        }).catch(err => console.log(err))

    }
    catch (err) {
        console.log(err)

        return res.json({ msg: "Link expired" })
    }
})


router.post("/resetPassword/:token", async (req, res) => {
    try {
        const { token } = req.params
        const { password } = req.body

        jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
            if (err) {
                console.log(err)
                return res.json({ success: false, msg: err })
            }

            const salt = await bcrypt.genSalt(10)
            const passwordHash = await bcrypt.hash(password, salt)
            const user = await User.findByIdAndUpdate({ _id: decoded.id }, { password: passwordHash })
            if (user) {
                return res.json({ msg: "Password Reset Successfully", success: true })

            }
            else {
                return res.json({ success: false })
            }


        })

    }
    catch (err) {
        console.log(err)
        return res.json({ success: false });
    }

})








module.exports = router