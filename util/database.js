const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoOptions = {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: true
};
mongoose.connect(process.env.MONGO_DB_URI, mongoOptions).then(() => console.log("Connected to the database")).catch(err => console.log('Database not connected'));
mongoose.connection.on('disconnected', () => {
    console.log("Disconnected from the database");
})