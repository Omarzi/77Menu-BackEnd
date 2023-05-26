const { check } = require("express-validator")
const validator = require("../middlewares/validator.middleware")

const {  PrismaClient } = require("@prisma/client")
const ApiError = require("./apiError")
const prisma = new PrismaClient()
exports.LoginValidator = [
    check("username").notEmpty().isLength({ min: 4 }).withMessage("Username must be at least 4 characters"),
    check("password").notEmpty().withMessage("Password Must Not Be Empty"),
    validator   
]

exports.SignUpValidator = [
    check("username").notEmpty().withMessage("Username must be at least 6 characters"),
    check("res_name").notEmpty().withMessage("Name must be at least 6 characters"),
    check("password").notEmpty().withMessage("Password Must Be At least 6 characters"),
    check("location").notEmpty().withMessage("Location must be at least 6 characters"),
    check("phone").isMobilePhone().withMessage("Please Enter Valid Phone Number"),
    check("id_stand").notEmpty().withMessage("Please Enter Stand ID").custom(async id => {
        await prisma.stand.findUnique({ where: { id:Number(id) } }).then((stand) => { 
            if (!stand) throw new ApiError("Stand Not Found With This ID")
        })
        return true
    }),
    check("id_res_type").notEmpty().withMessage("Please Enter Valid Menu Type ID ").custom(async id => {
        await prisma.res_type.findUnique({ where: { id: Number(id) }}).then((res_type) => {
            if (!res_type) throw new ApiError("Menu Not Found With This ID")
        })
        return true
    }),
    validator
]

exports.changePasswordValidator = [
    check("oldPassword").notEmpty().isLength({min:6}).withMessage("Please Provide A Valid Password With Min char 6"),
    check("newPassword").notEmpty().isLength({ min: 6 }).withMessage("Please Provide A Valid Password With Min char 6").custom((password, { req }) => {
        if (password !== req.body.confirmNewPassword) throw new ApiError("Password And confirmPassword Not Match")
        return true
    }),

    validator
]