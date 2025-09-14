// netlify/functions/create-order.js

const Razorpay = require("razorpay");

exports.handler = async (event) => {
  try {
    // body ko parse karna (agar empty ho to crash na ho)
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch {
        body = {};
      }
    }

    // Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Order options
    const options = {
      amount: 24900, // ₹249 = 24900 paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      notes: body, // customer details bhi save ho jaayenge
    };

    // Order create karna
    const order = await razorpay.orders.create(options);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        key: process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message }),
    };
  }
};
