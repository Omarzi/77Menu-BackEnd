const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendOTP = async (phone) => {
    try {
        const Sender = await client.verify.v2
            .services(process.env.TWILIO_SERVICE_ID)
            .verifications.create({ to: phone, channel: "sms" })
        return Sender.status === "pending" ? true : false
    } catch (error) {
        console.log(error)
    }

}

exports.verifOTP = async (otp, phone) => {
    console.log(phone,otp)
    try {
        const verification = await client.verify.v2
            .services(process.env.TWILIO_SERVICE_ID)
            .verificationChecks.create({ to: phone, code: otp })
        return verification.status === "approved" ? true : false
    } catch (error) {
        console.error(error)
    }
}
