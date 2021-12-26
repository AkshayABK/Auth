require('dotenv').config()
const express =require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')

const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true
}))
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

const URI = process.env.MONGO_DB 
mongoose.connect( URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true

}, err =>{
    if(err) throw err 
    console.log("MongoDB Connected Succesfully!!");
})

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    console.log("Server is running on PORT", PORT);
})

app.use('/user', require('./router/userRouter'))
app.use('/api', require('./router/upload'))