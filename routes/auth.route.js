const router = require("express").Router()

const { Login, getStands, getMenus, signUp, getUserInfo, changePassword, forgetPassword, verifyOTP, reset_password } = require("../controllers/Auth.controller") 
const { LoginValidator, SignUpValidator, changePasswordValidator } = require("../utils/auth.validator") 
const imgUploader = require("../middlewares/imgUploader.middleware") 
const verifyToken = require("../middlewares/verifyToken")
const { check } = require("express-validator")
const validatorMiddleware = require("../middlewares/validator.middleware")
const ApiError = require("../utils/apiError")
router.post("/login", LoginValidator,Login)
router.get("/stands", getStands)
router.post("/forget_password",[check("phone").isMobilePhone().withMessage("Please Provide Valid Phone"),validatorMiddleware] ,forgetPassword)
router.post("/verify_otp", [check("phone").isMobilePhone().withMessage("Please Provide Valid Phone"), validatorMiddleware],verifyOTP)
router.put("/reset_password/:id", [check("id").notEmpty().withMessage("Please Provide Valid Phone"),
    check("newPassword").notEmpty().isLength({ min: 6 }).withMessage("Please Provide Valid Password With Min Char 6").custom((password, { req }) => {
        if (!password === req.body.confirmNewPassword) throw new ApiError("Password And Confirm Password Must Equal")
        return true
    })
    , validatorMiddleware], reset_password)
router.get("/menus", getMenus)

router.post("/signup", imgUploader.single("logo"), SignUpValidator, signUp)
router.get("/user", verifyToken, getUserInfo)
router.put("/user/change_password", verifyToken, changePasswordValidator,changePassword)
module.exports = router