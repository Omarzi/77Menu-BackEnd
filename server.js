const express = require("express") 
const path = require("path") 
const cors = require("cors") 
const morgan = require("morgan") 
const dotenv = require("dotenv") 
const globalError = require("./middlewares/globalError.middleware") 
const verifyRole = require("./middlewares/verifyRole")
const app = express()
app.use(cors())
dotenv.config()

app.use(express.json())
app.use("/images", express.static(path.join(__dirname, "images")))
app.use(express.urlencoded({ extended: true }))
process.env.NODE_ENV === "development" && app.use(morgan("dev"))


app.use("/auth", require("./routes/auth.route"))
app.use("/admin", require("./routes/admin.route"))
app.use("/user",verifyRole("client"),require("./routes/user.route"))




app.get("/payment/cancel", (req,res) => {
    res.send("cancel")
})
app.use(globalError)
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Listening On Port ${PORT}`)
})

module.exports = app

process.on("unhandledRejection", (err) => {
    console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
    app.close(() => {
        console.error(`Shutting down....`);
        process.exit(1);
    });
});