const mongoose = require('mongoose');

async function connectDB(){
    try {
        const connection = await mongoose.connect(process.env.MONGO_DB_URI)
        console.log("MongoDB connected Successfully")
    } catch (error) {
        console.log("Error connecting mongoDB :", error)
    }
}

module.exports = connectDB;