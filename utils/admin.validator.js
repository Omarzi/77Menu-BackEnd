const { check } = require("express-validator")
const validator = require("../middlewares/validator.middleware")
exports.StandValidator = [
    check("name").notEmpty().withMessage("Please Provide Valid Name For Stand"),
    check("price").notEmpty().withMessage("Please Provide Valid Price For Stand"),
    check("des").notEmpty().withMessage("Please Provide Valid Description For Stand"),
    validator
]

exports.MenuValidator = [
    check("res_cat").notEmpty().withMessage("Please Provide Valid Resturant Menu Category  "),
    check("price").notEmpty().withMessage("Please Provide Valid Price For Resturant Menu "),
    check("des").notEmpty().withMessage("Please Provide Valid Description For Resturant Menu "),
    check("notes").notEmpty().withMessage("Please Provide Valid Notes For Resturant Menu "),
    validator
]