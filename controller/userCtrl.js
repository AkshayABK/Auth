const Users = require('../model/validation')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const sendMail = require('./sendMail')
const sendEmail = require('./sendMail')
const { findOne } = require('../model/validation')

const {CLIENT_URL} = process.env

const userCtrl = {
    register: async (req, res) =>{
        try{
            const {name, email, password} = req.body
            
            if(!name || !email || !password)
                return res.status(400).json("Please fill the all field's")

            if(!validateEmail(email))
            return res.status(400).send("Invalid email")    

            const user = await Users.findOne({email})
            if (user) return res.status(404).json({msg:"This email already exist."})
                    
            if (password.length<6)
                return res.status(404).json({msg:"Password must be at least 6 character."})

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = {
                name, email, password:passwordHash
            }
            const activation_token = createActivationToken(newUser)

            const url = `${CLIENT_URL}/user/activation/${activation_token }`
            sendMail(email, url, "Verify your email")
            
            res.json({msg: "Register success! Please activate your email to start."})
        } catch (err){
            return res.status(500).json({msg: err.message})
        }
    },
    activationEmail: async (req, res) =>{
        try{
            const {activation_token} = req.body                                                                                                                                                                                                                                                         
            const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN)

            const {name, email, password} = user

            const check =await Users.findOne({email})
            if(check) return res.status(400).json({msg:"This email already exist."})

            const newUser = new Users({
                name, email, password
            })
            
            await newUser.save()

            res.json({msg: "Account has been activated!"})

        }catch (err){
            if (err) return res.status(500).json({msg: err.message})     
        }
    },
    login: async (req, res) =>{
        try {
            const {email, password} = req.body
            const user = await Users.findOne({email})
            if(!user)
            return res.status(400).json({msg:"This email does not exist!"})  
            console.log(user);

            const checkPassword = await bcrypt.compare(password,user.password)
            if (!checkPassword) return res.status(400).json({msg:"Incorrect Password"})
            
            const refresh_token = createRefreshToken({id:user._id})
            
            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path:'/user/refresh_token',
                maxAge: 7*24*60*60*1000
            })
            res.json({msg:"Login Succesfully!"})
        } catch (err) {
            if (err) return res.status(500).json({msg: err.message})
        }
        
    },
    getAccessToken:(req, res)=>{
        try {
            const ref_token = req.cookies.refreshtoken
            if (!ref_token) {
                return res.status(400).json({msg:"Please login!"})
            }   

            jwt.verify(ref_token, process.env.REFRESH_TOKEN, (err, user)=>{
                if (err) return res.status(400).json({msg:"Please login"})

                const access_token = createAccessToken({id:user.id})
                res.json({access_token})

                console.log(user);
            })
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    forgotPassword: async (req, res)=>{
        try {
            const {email} = req.body 

            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg:"Email doesn't exist!!"})

            const access_token = createAccessToken({id:user._id})
            const url = `${CLIENT_URL}/user/reset/${access_token}`
            sendEmail(email, url, "Reset Password")

            res.json({msg:"Re-send the password, please check your email."})
        } catch (err) {
            return res.status(500).json({msg:err.message}) 
            
        }
    },
    resetPassword: async (req, res)=>{
        try {
            const {password} = req.body
         
            const passHash = await bcrypt.hash(password, 12)
            
            await Users.findOneAndUpdate({_id:req.user.id}, {
                password:passHash
            })
            res.json({msg:"Password Succesfully Updated."})
            
        } catch (err) {
            return res.status(500).json({msg:err.message}) 
        }
         
    },
    getUserInfo: async (req, res)=>{
        try {
            // const user = await findOne(user.email)
            const user = await Users.findById(req.User.id).select('-password')

            res.json(user)
            
        } catch (err) {
            return res.status(500).json({msg:err.message}) 
        }
    },
    getUsersAllInfo: async (req, res)=>{
        try {
            const users =await Users.find().select('-password')
            console.log(users);
            res.status(200).json({
                status: 'success',
                data: {
                  users
                }
              });
            
        } catch (err) {
            return res.status(500).json({msg:err.message})  
        }
    },
    logout: async (req, res)=>{
        try {
            res.clearCookie('refreshtoken', { path:'/user/refresh_token'})
            return res.status(200).json({msg: "Logged out."})
        } catch (err) {
            return res.status(500).json({msg:err.message}) 
        }
    },
    userUpdate: async (req, res)=>{
        try {
            const {name, avtar} = req.body
            await Users.findOneAndUpdate({_id:req.user.id}, {
                name, avtar
            })
            
            res.json({msg:"Update Succesfully!"})

        } catch (err) {
            
            return res.status(500).json({msg:err.message}) 
        }
    },
    updateUserRole: async (req, res)=>{
        try {
            const {role} = req.body
            await Users.findOneAndUpdate({_id:req.params.id}, {
                role
            })
            
            res.json({msg:"Update Succesfully!"})

        } catch (err) {
            
            return res.status(500).json({msg:err.message}) 
        }
    },
    deleteUser: async (req, res)=>{
        try { 
            await Users.findByIdAndDelete({_id:req.params.id})
            
            res.json({msg:"Deleted User data!!"})

        } catch (err) {
            
            return res.status(500).json({msg:err.message}) 
        }
    }

}

function validateEmail(email){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email);
}

function createActivationToken(payload){
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN, {expiresIn:'5m'})
}

const createAccessToken = (payload) =>{
    return jwt.sign(payload, process.env.ACCESS_TOKEN, {expiresIn:'15m'})
}

const createRefreshToken = (payload) =>{
    return jwt.sign(payload, process.env.REFRESH_TOKEN, {expiresIn:'7d'})
}

module.exports = userCtrl