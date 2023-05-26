const multer = require("multer")
const fs = require('fs')

module.exports = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (!fs.existsSync('images')) fs.mkdirSync('images')
            cb(null, 'images')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "__" + file.originalname)

        }
    })
})