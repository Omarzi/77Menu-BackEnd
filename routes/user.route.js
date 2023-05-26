const router = require("express").Router()

const { check } = require("express-validator")
const { makeMenu, addProduct, userMenus, getMenuProduct, aranging_product, aranging_menu, changeMenuInfo, changeProductInfo, deleteMenu, deleteProduct,pay } = require("../controllers/User.controller")
const imgUploaderMiddleware = require("../middlewares/imgUploader.middleware")
const { menuProductsValidator, productValidator } = require("../utils/user.validator")
const validatorMiddleware = require("../middlewares/validator.middleware")


router.post("/menu", imgUploaderMiddleware.single("menu_img"), menuProductsValidator, makeMenu)

router.get("/product/:menu_id", getMenuProduct)
router.post("/product/:menu_id", imgUploaderMiddleware.single("product_img"), productValidator, addProduct)

router.get("/menu/:main_table_id",userMenus)

router.put("/product/arranging/:product_id",
    [
        check("product_id").notEmpty().withMessage("Please Provide Product Id"),
        check("aranging").notEmpty().withMessage("Please Provide Aranging Of Product"),
        validatorMiddleware
    ]
    , aranging_product)

router.put("/menu/arranging/:menu_id",
    [
        check("menu_id").notEmpty().withMessage("Please Provide Menu Id"),
        check("aranging").notEmpty().withMessage("Please Provide Aranging Of Menu"),
        validatorMiddleware
    ]
    , aranging_menu)

router.put("/menu/:menu_id",
    imgUploaderMiddleware.single("menu_img"),
    [
        check("menu_id").notEmpty().withMessage("Please Provide Menu Id"),
        check("menu_ar").optional().notEmpty().withMessage("Please Provide Menu Ar "),
        check("menu_en").optional().notEmpty().withMessage("Please Provide Menu En "),
        check("menu_heb").optional().notEmpty().withMessage("Please Provide Menu Of Hep"),
    validatorMiddleware
    ]
    , changeMenuInfo)

router.put("/product/:product_id",
    imgUploaderMiddleware.single("product_img"),
    [
        check("product_id").notEmpty().withMessage("Please Provide Product Id"),
        check("product_ar").optional().optional().notEmpty().withMessage("Please Provide Product Ar "),
        check("product_en").optional().notEmpty().withMessage("Please Provide Product En "),
        check("product_heb").optional().notEmpty().withMessage("Please Provide Product Of Hep"),
        check("des_ar").optional().notEmpty().withMessage("Please Provide Product Description Ar "),
        check("des_en").optional().notEmpty().withMessage("Please Provide Product Description En "),
        check("des_heb").optional().notEmpty().withMessage("Please Provide Product Description heb"),
        check("price").optional().notEmpty().withMessage("Please Provide Product Price"),
        check("m").optional().notEmpty().withMessage("Please Provide Product Price m"),
        check("l").optional().notEmpty().withMessage("Please Provide Product Price l"),
        check("xl").optional().notEmpty().withMessage("Please Provide Product Price xl"),
        check("xxl").optional().notEmpty().withMessage("Please Provide Product Price xxl"),
        validatorMiddleware
    ],
    changeProductInfo)

router.delete("/menu/:menu_id",[check("menu_id").notEmpty().withMessage("Please Provide Menu Id"),validatorMiddleware],deleteMenu)
router.delete("/product/:product_id", [check("product_id").notEmpty().withMessage("Please Provide Product Id"), validatorMiddleware], deleteProduct)
router.post("/pay/:id_res_type",pay)
module.exports = router