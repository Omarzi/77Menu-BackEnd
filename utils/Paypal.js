const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': process.env.PAYPAL_MODE,
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});



exports.makePayment = (item) => {
    const paymentData = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": process.env.SUCESS_REDIRECT_URL,
            "cancel_url": process.env.CANCEL_REDIRECT_URL
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": item.name,
                    "price": item.price,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": item.price
            },
            "description": item.name
        }]
    };
    return paypal.payment.create(paymentData, (error, payment) => {
        if (error) {
            console.error(error);
            return error.message
        } else {
            console.log(payment);
            const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
            return approvalUrl
        }
    });
}


exports.success = (payerId, paymentId, price) => {

    const executePaymentData = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": price
            }
        }]
    }
    paypal.payment.execute(paymentId, executePaymentData, (error, payment) => {
        if (error) {
            console.error(error);
            return error
        } else {
            console.log(payment);
            return payment
        }
    });
}