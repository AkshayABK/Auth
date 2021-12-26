const router = require('express').Router()
const upload_image = require('../middleware/upload_image')
const uploadCtrl = require('../controller/uploadCtrl')
const auth = require('../middleware/auth')

router.post('/upload_avtar', upload_image,  uploadCtrl.uploadAvtar)

module.exports = router