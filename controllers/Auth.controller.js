const asyncHandler = require("express-async-handler") 
const bcrypt = require("bcrypt") 
const ApiError = require("../utils/apiError") 
const jwt = require( "jsonwebtoken")
const { PrismaClient } = require("@prisma/client") 
const { sendOTP, verifOTP } = require("../utils/twilio")
const prisma = new PrismaClient()



exports.getStands = asyncHandler(async (req, res, next) => {
    const stands = await prisma.stand.findMany({})
    res.json({stands})
})

exports.getMenus = asyncHandler(async (req, res, next) => {
    const menus = await prisma.res_type.findMany({})
    res.json({menus})
})

exports.signUp = asyncHandler(async (req, res, next) => {
    const logo = req.file && req.file.path
    const { username, res_name, location, phone, password, id_stand, id_res_type,stand_quantity } = req.body
    if(!logo) return next(new ApiError("Logo Is Required",400))
    await prisma.main_table.findFirst({
        where: {
            OR: [
                { res_name },
                {phone}
    ] } }).then(async table => {
        if (table) return next(new ApiError("Username Or Phone is Already Exists",409))
        const current_date = new Date(Date.now())
        const end_date = new Date(current_date.getFullYear() + 1, current_date.getMonth(), current_date.getDate());
        await prisma.main_table.create({
            data:
            {
                
                res_name,
                location,
                phone,
                stand: {
                    connect: {
                        id:Number(id_stand)
                    }
                },
                res_type: {
                    connect: {
                        id:Number(id_res_type)
                    }
                },
                logo,
                end_date
            }
        }).then(async (main_table, err) => {
            if (err) return next(new ApiError(err.message, err.status))
            const stand = await prisma.stand.findUnique({ where: { id: Number(id_stand) } })
            const menu = await prisma.res_type.findUnique({ where: { id: Number(id_res_type) } })
            await prisma.user_group.create({
                data: {
                    username,
                    password: await bcrypt.hash(password, 10),
                    id_res: main_table.id,
                    stand_quantity: Number(stand_quantity),
                    totalprice: Number(stand_quantity) * stand.price + menu.price
                }
            }).then((user) => {
                res.status(201).json({main_table,user})
            })
        })
    })
})

exports.Login = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body
    if (!username || !password) return next(new ApiError("Username And Password Are Required", 404))
    const user = await prisma.user_group.findUnique({ where: { username } })
    if (!user) return next(new ApiError("User Not Found", 404))
    const matchPassword = await bcrypt.compare(password, user.password)
    if (!matchPassword) return next(new ApiError("Password Not Match ", 400))
    if (!user.submitted) return next(new ApiError("User Not Submitted", 401))
    await prisma.main_table.findUnique({where:{ id: user.id_res }}).then((table) => {
        if (table.end_date.getTime() <= Date.now()) return next(new ApiError("Your Subscription has expired Please Contact With Admin",403))
    })
    const token = jwt.sign({ id: user.id, user_type: user.user_type }, process.env.TOKEN, { expiresIn: "7d" })
    delete user.password
    res.json({ user, token })

})

exports.forgetPassword = asyncHandler(async (req, res, next) => {
    const { phone } = req.body
    await prisma.main_table.findFirst({ where: { phone } }).then(async(table) => {
        if (!table) return next(new ApiError("User Not Found", 404))
        const sender = sendOTP(phone)
        if (!sender) return next(new ApiError("Error While Sending OTP", 409))
        res.status(200).json({"message":`OTP Code Sent To ${phone}`})
    })
})

exports.verifyOTP = asyncHandler(async (req, res, next) => {
    const { phone,otp } = req.body
    const verification = verifOTP(otp,phone)
    if (!verification) return next(new ApiError("Invalid OTP", 403))
    await prisma.main_table.findFirst({ where: { phone } }).then(async table => {
        await prisma.user_group.findFirst({ where: { id_res: table.id } }).then(user => {
            if(!user) return next(new ApiError("User Not Found",404))
            res.json({id:user.id})
        })
    })
})

exports.reset_password = asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id)
    const { newPassword } = req.body
    await prisma.user_group.findUnique({ where: { id } }).then(async (user) => {
        if (!user) return next(new ApiError("User Not Found", 404))
        await prisma.user_group.update({where:{id},data:{password:await bcrypt.hash(newPassword,10)}}).then(()=>res.sendStatus(200))
    })
})

exports.getUserInfo = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    await prisma.user_group.findUnique({ where: { id }, include: { main_table: true } }).then((user) => res.json({ userInfo:user }))
})

exports.changePassword = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    const { oldPassword, newPassword } = req.body
    await prisma.user_group.findUnique({ where: { id } }).then(async user => {
        const match = await bcrypt.compare(oldPassword, user.password)
        if (!match) return next(new ApiError("Password No Match", 400))
        await prisma.user_group.update({where:{id},data:{password:await bcrypt.hash(newPassword,10)}}).then(user=>res.json({user}))
    })
})