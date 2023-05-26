const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const ApiError = require("../utils/apiError");
const prisma = new PrismaClient()

exports.addStand = asyncHandler(async (req, res, next) => {
    const standImg = req.file && req.file.path
    const { name, price, des } = req.body
    await prisma.stand.findFirst({ where: { name } }).then(async(stand) => {
        if (stand) return next(new ApiError("This Stand Is Already Found", 409)) 
        await prisma.stand.create({ data: { name, price:Number(price), des,image_stand:standImg } }).then((done, err) => {
            if (err) return next(new ApiError(err.message, err.statusCode))
            res.status(201).json({stand:done})
        })
    })
})

exports.addMenuType = asyncHandler(async (req, res, next) => {
    const { res_cat, price, des, notes } = req.body
    await prisma.res_type.findFirst({ where: { res_cat } }).then(async menu => {
        if (menu) return next(next(new ApiError("This Menu Type is Already Exists", 409)))
        await prisma.res_type.create({ data: { res_cat, price: Number(price), des, notes: notes && notes.trim() } }).then((done, err) => {
            if (err) return next(new ApiError(err.message, err.statusCode))
            res.status(201).json({ menu: done })
        })
    })
})

exports.submitUser = asyncHandler(async (req, res, next) => {
    const { user_id } = req.params
    await prisma.user_group.findUnique({ where: { id: parseInt(user_id) } }).then(async(user, err) => {
        if (err) return next(new ApiError(err.message, err.statusCode))
        if (!user) return next(new ApiError("User not found", 404))
        await prisma.user_group.update({ where: { id:parseInt(user_id)},data:{submitted:true}}).then(user => res.json({user}))
    })
}) 