const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = Schema({
    name:{
        type:String,
        require: [true, "Please enter your Name!!"],
        trim:true
    },
    email:{
        type:String,
        require: [true, "Please enter your email!!"],
        trim:true,
        unique:true
    },
    password:{
        type:String,
        require: [true, "Please enter your password!"]
    },
    role:{
        type:Number,
        default:0
    },
    avtar:{
        type:String,
        default:"https://res.cloudinary.com/kalpas-innovation-pvt-ltd-hubli/image/upload/v1639733748/avtar_xu1jpf.png"
    }
},{
    timestamps: true
})

module.exports = mongoose.model("Users", userSchema)