const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema(
    userData = {
        name: String,
        email: String,
        password: String
    },
    playerData = {
        position: [Number,Number,Number],
        color: String
    },
    {
        timestamps: true
    }
);
const userdata = model('user', userSchema);
module.exports = userdata;