const express = require("express")
require("dotenv").config()
const cors = require("cors")
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: false }))
const connectDB = require("./config/db")
const apiRouter = require('./routes')
const PORT = 4000 || process.env.PORT

app.use("/api", apiRouter)
app.use(cors())
connectDB()

app.get('/', (req, res) => {
    res.send(`Api is working URL shortener`)
})

app.listen(PORT, () => console.log(`server is up and running on ${PORT} PORT`))