const mongoose = require("mongoose")

const url = process.env.MONGODBURL
mongoose.set("strictQuery", false)
const connectDB = async () => {
    try {
        const connect = await mongoose.connect(url)
        console.log(`MONGODB CONNECTED ${connect.connection.host}`)
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB
