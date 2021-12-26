const router = require('express').Router()
const userCtrl = require('../controller/userCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')
const auth_admin = require('../middleware/authAdmin')

router.post('/register', userCtrl.register)

router.post('/activation', userCtrl.activationEmail)

router.post('/login', userCtrl.login)

router.post('/refresh_token', userCtrl.getAccessToken)

router.post('/forgot', userCtrl.forgotPassword)

router.post('/reset', auth, userCtrl.resetPassword)

router.get('/userInfo', auth, userCtrl.getUserInfo)

router.get('/allUsersInfo', auth, auth_admin, userCtrl.getUsersAllInfo)

router.get('/logout', userCtrl.logout)

router.patch('/update', auth, userCtrl.userUpdate)

router.patch('/updateUserRole/:id', auth, authAdmin, userCtrl.updateUserRole)

router.delete('/delete_user/:id', auth, authAdmin, userCtrl.deleteUser)


module.exports = router

