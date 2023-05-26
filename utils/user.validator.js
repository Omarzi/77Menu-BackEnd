const { check } = require("express-validator")
const validator = require("../middlewares/validator.middleware")

exports.productValidator=[
    check("product_ar").notEmpty().withMessage("Please provide a valid product Ar"),
    check("product_en").notEmpty().withMessage("Please provide a valid product En"),
    check("product_heb").notEmpty().withMessage("Please provide a valid product heb"),
    check("des_ar").notEmpty().withMessage("Please provide a valid product Des Ar"),
    check("des_en").notEmpty().withMessage("Please provide a valid product Des En"),
    check("des_heb").notEmpty().withMessage("Please provide a valid product Des hub"),
    check("price").notEmpty().withMessage("Please provide a valid product price "),
    check("m").notEmpty().withMessage("Please provide a valid product price m"),
    check("l").notEmpty().withMessage("Please provide a valid product price l"),
    check("xl").notEmpty().withMessage("Please provide a valid product price xl"),
    check("xxl").notEmpty().withMessage("Please provide a valid product price xxl"),
    validator
]


exports.menuProductsValidator =  [
    check("menu_ar").notEmpty().withMessage("Please Provide Valid Menu In Arabic"),
    check("menu_en").notEmpty().withMessage("Please Provide Valid Menu In English"),
    check("menu_heb").notEmpty().withMessage("Please Provide Valid Menu In Heb"),
    validator]