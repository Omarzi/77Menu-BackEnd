const jwt = require("jsonwebtoken")
const ApiError = require("../utils/apiError")

module.exports = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1]
    if (!token) return next(new ApiError("Invalid authorization token", 401))
    jwt.verify(token, process.env.TOKEN, (err, decoded) => {
        if (err) return next(new ApiError(err.message,401))
        req.user = decoded
        next()
    })
}