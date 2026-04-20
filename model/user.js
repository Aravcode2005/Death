const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema(

    {
        name: String,
        email: String,
        password: String
    },
    {
        timestamps: true
    }
);
const userdata = model('user', userSchema);
module.exports = userdata;