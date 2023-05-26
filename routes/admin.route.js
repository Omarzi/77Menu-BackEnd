const router = require("express").Router()

const imgUploader =require("../middlewares/imgUploader.middleware") 
const { StandValidator, MenuValidator }= require("../utils/admin.validator") 
const { addStand, addMenuType, submitUser } =require("../controllers/Admin.controller") 



router.post("/stand", imgUploader.single("stand_img"), StandValidator, addStand)
router.post("/menu", MenuValidator, addMenuType)
router.put("/user/:user_id", submitUser)

module.exports= router