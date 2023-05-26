
const { PrismaClient } = require("@prisma/client")
const asyncHandler = require("express-async-handler")
const ApiError = require("../utils/apiError")
const prisma = new PrismaClient()


exports.makeMenu = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    const { menu_ar, menu_en, menu_heb } = req.body
    const image = req.file && req.file.path
    if (!image) return next(new ApiError("image is Required"))
    await prisma.user_group.findUnique({ where: { id } }).then(async user => {
        await prisma.menus.create({
            data: {
                menu_ar,
                menu_en,
                menu_heb,
                image,
                id_res: user.id_res,
                aranging: (await prisma.menus.findMany({})).length + 1
            }
        }).then((menu) => {
            res.json({ menu })
        })
    })
})

exports.addProduct = asyncHandler(async (req, res, next) => {
    const { product_ar, product_en, product_heb, des_ar, des_en, des_heb, price, m, l, xl, xxl } = req.body
    const product_img = req.file && req.file.path
    if (!product_img) return next(new ApiError("Please provide a product image", 400))
    const { menu_id } = req.params
    await prisma.menus.findUnique({ where: { id: Number(menu_id) } }).then(async (menu, err) => {
        if (err) return next(new ApiError(err.message, err.statusCode))
        if (!menu) return next(new ApiError("Can't Find Menu", 404))
        await prisma.product.create({
            data: {
                product_ar,
                product_en,
                product_heb,
                des_ar,
                des_en,
                des_heb,
                price,
                m,
                l,
                xl,
                xxl,
                image_product: product_img,
                id_menus: Number(menu_id),
                aranging: (await prisma.product.findMany({})).length + 1
            }
        }).then((product) => res.status(201).json({ product }))
    })
})

exports.userMenus = asyncHandler(async (req, res, next) => {
    await prisma.menus.findMany({ where: { id_res: Number(req.params.main_table_id) }, orderBy: { aranging: "asc" } }).then(menus => res.json(menus))
})

exports.getMenuProduct = asyncHandler(async (req, res, next) => {
    await prisma.product.findMany({ where: { id_menus: Number(req.params.menu_id) }, orderBy: { aranging: "asc" } }).then(products => res.json({ products }))
})

exports.changeMenuInfo = asyncHandler(async (req, res, next) => {
    const menu_id = Number(req.params.menu_id)
    const { menu_ar, menu_en, menu_heb } = req.body
    const menu_img = req.file && req.file.path

    await prisma.menus.findUnique({ where: { id: menu_id } }).then(async (menu) => {
        if (!menu) return next(new ApiError("Menu Not Found", 404))
        await prisma.menus.update({
            where: { id: menu_id },
            data: {
                menu_ar: menu_ar && menu_ar,
                menu_en: menu_en && menu_en,
                menu_heb: menu_heb && menu_heb,
                image: menu_img && menu_img
            }
        }).then((menu, err) => {
            if (err) return next(new ApiError(err.message, err.statusCode))
            res.json({ menu })
        })
    })

})

exports.aranging_product = asyncHandler(async (req, res, next) => {
    const product_id = Number(req.params.product_id)
    const aranging = Number(req.query.aranging)
    let done = false
    await prisma.$transaction(async (prisma) => {
        const product = await prisma.product.findUnique({ where: { id: product_id } })
        if (!product) throw new Error(`Product with id ${product_id} not found`)
        const siblings = await prisma.product.findMany({
            where: { id_menus: product.id_menus },
            orderBy: { aranging: 'asc' },
        })
        const index = siblings.findIndex((p) => p.id === product_id)
        if (index === -1) throw new Error(`Product with id ${product_id} not found in siblings`)
        if (siblings[index].aranging === aranging) {
            done = true
            return res.sendStatus(200)
        }
        if (siblings.some((p) => p.aranging === aranging)) {
            await prisma.product.updateMany({
                where: { id_menus: product.id_menus, aranging: { gte: aranging } },
                data: { aranging: { increment: 1 } },
            }).then(async () => await prisma.product.update({ where: { id: product_id }, data: { aranging: aranging } }))
        } else await prisma.product.update({ where: { id: product_id }, data: { aranging: aranging } })
    })
    if (!done) {
        await prisma.product.findMany({ orderBy: { aranging: "asc" } }).then(async products => {
            products.map(async (pro, i) => {
                await prisma.product.update({ where: { id: pro.id }, data: { aranging: i + 1 } })
            })
            res.sendStatus(200)
        })
    }
})

exports.aranging_menu = asyncHandler(async (req, res, next) => {
    const menu_id = Number(req.params.menu_id)
    const aranging = Number(req.query.aranging)
    let done = false
    await prisma.$transaction(async (prisma) => {
        const menu = await prisma.menus.findUnique({ where: { id: menu_id } })
        if (!menu) throw new Error(`Menu with id ${menu_id} not found`)
        const siblings = await prisma.menus.findMany({
            where: { id_res: menu.id_res },
            orderBy: { aranging: 'asc' },
        })
        const index = siblings.findIndex((p) => p.id === menu_id)
        if (index === -1) throw new Error(`Menu with id ${menu_id} not found in siblings`)
        if (siblings[index].aranging === aranging) {
            done = true
            return res.sendStatus(200)
        }
        if (siblings.some((p) => p.aranging === aranging)) {
            await prisma.menus.updateMany({
                where: { id_res: menu.id_res, aranging: { gte: aranging } },
                data: { aranging: { increment: 1 } },
            }).then(async () => await prisma.menus.update({ where: { id: menu_id }, data: { aranging: aranging } }))
        } else await prisma.menus.update({ where: { id: menu_id }, data: { aranging: aranging } })
    })
    if (!done) {
        await prisma.menus.findMany({ orderBy: { aranging: "asc" } }).then(async all_menus => {
            all_menus.map(async (men, i) => {
                await prisma.menus.update({ where: { id: men.id }, data: { aranging: i + 1 } })
            })
            res.sendStatus(200)
        })
    }
})

exports.changeProductInfo = asyncHandler(async (req, res, next) => {
    const product_id = Number(req.params.product_id)
    const { product_ar, product_en, product_heb, des_ar, des_en, des_heb, price, m, l, xl, xxl } = req.body
    const product_img = req.file && req.file.path
    await prisma.product.findUnique({ where: { id: product_id } }).then(async product => {
        if (!product) return next(new ApiError("Product Not Found", 404))
        await prisma.product.update({
            where: { id: product_id },
            data: {
                product_ar: product_ar && product_ar,
                product_en: product_en && product_en,
                product_heb: product_heb && product_heb,
                des_ar: des_ar && des_ar,
                des_en: des_en && des_en,
                des_heb: des_heb && des_heb,
                price: price && price,
                m: m && m,
                l: l && l,
                xl: xl && xl,
                xxl: xxl && xxl,
                image_product: product_img && product_img
            }
        }).then(product => res.json({ product }))
    })

})

exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const product_id = Number(req.params.product_id)
    await prisma.product.findUnique({ where: { id: product_id } }).then(async product => {
        if (!product) return next(new ApiError("Product not found", 404))
        await prisma.product.delete({ where: { id: product_id } }).then(() => res.sendStatus(200))
    })
})

exports.deleteMenu = asyncHandler(async (req, res, next) => {
    const menu_id = Number(req.params.menu_id)
    await prisma.$transaction(async (prisma) => {
        await prisma.product.deleteMany({
            where: {
                id_menus: menu_id,
            },
        }).then(async () => {
            await prisma.menus.delete({
                where: {
                    id: menu_id,
                },
            }).then(() => res.sendStatus(200))
        })
    })
})

exports.pay = asyncHandler(async (req, res, next) => {
    const { type } = req.query
    const id = Number(req.user.id)
    const id_res_type = Number(req.params.id_res_type)
    const user = await prisma.user_group.findUnique({ where: { id } })
    const perivousMenuPrice = (await prisma.main_table.findUnique({ where: { id: user.id_res }, include: { res_type: true } })).res_type.price

    await prisma.res_type.findUnique({ where: { id: id_res_type } }).then(async menu_type => {
        if (!menu_type) return next(new ApiError("This Menu Not Found", 404))
        let price = perivousMenuPrice == menu_type.price ? menu_type.price : menu_type.price - perivousMenuPrice 
        if (type === "paypal") {
            const paypal = require('paypal-rest-sdk')
            const app = require("../server")
            paypal.configure({
                'mode': process.env.PAYPAL_MODE,
                'client_id': process.env.PAYPAL_CLIENT_ID,
                'client_secret': process.env.PAYPAL_CLIENT_SECRET
            });
            const paymentData = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:8080/success",
                    "cancel_url": "http://localhost:8080/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": menu_type.res_cat,
                            "price": price,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": price
                    },
                    "description": menu_type.res_cat
                }]
            };
            paypal.payment.create(paymentData, (error, payment) => {
                if (error) {
                    console.error(error);
                    res.send(error)
                } else {
                    const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
                    res.json({approvalUrl})
                }
            });
            
            app.get("/success", (req,res) => {
                const paymentId = req.query.paymentId;
                const payerId = req.query.PayerID;
                const executePaymentData = {
                    "payer_id": payerId,
                    "transactions": [{
                        "amount": {
                            "currency": "USD",
                            "total": `${price}`
                        }
                    }]
                }
                paypal.payment.execute(paymentId, executePaymentData, async (error, payment)=> {
                    if (error) {
                        console.log(error.response);
                        res.send(error)
                    } else {
                        await prisma.main_table.update(
                            {
                                where: { id: user.id_res },
                                data: {
                                    create_date: new Date(Date.now()),
                                    end_date: new Date(new Date(Date.now()).getFullYear() + 1, new Date(Date.now()).getMonth(), new Date(Date.now()).getDate() + 1),
                                    id_res_type
                                }
                            }).then(() => res.sendStatus(200))
                    }
                });
            })
            app.get("/cancel",(req,res)=>res.send("cancel"))
        }
        else {
            res.send("This Method Is Not Avalible Right Now")
        }
    })
})