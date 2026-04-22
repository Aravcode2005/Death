const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
try {
    console.log("Connected to the database")
    mongoose.connect(process.env.MONGO_DB_URI);
} catch (error) {
    console.log("Error" + error)
}