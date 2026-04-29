const mongoose = require('mongoose')

const OtpSchema = mongoose.Schema({
    email:{type:String, required:true, unique:true},

    otp:{type:String, required:true},
    expires:{
        type:Date,
        default:Date.now,
        expires:300
    }
}, {timestamps:true})

const OtpModel = mongoose.model("otp", OtpSchema)

module.exports = OtpModel

