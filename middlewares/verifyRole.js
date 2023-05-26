const jwt = require("jsonwebtoken")
const ApiError = require("../utils/apiError")


module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1]
        if (!token) return next(new ApiError("Invalid authorization token", 400))
        jwt.verify(token, process.env.TOKEN, (err, decoded) => {
            if (err) return next(new ApiError(err.message, 401))
            if (!allowedRoles.includes(decoded.user_type)) return next(new ApiError("You Don't Have Permission to access this API", 401))
            req.user = decoded
            next()
        })
    }
}