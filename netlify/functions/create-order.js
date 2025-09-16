// netlify/functions/create-order.js
const Razorpay = require("razorpay");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const body = JSON.parse(event.body);

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: 24900, // ₹249 in paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      notes: {
        name: body.name,
        email: body.email,
        mobile: body.mobile,
        vehicle: body.vehicle,
      },
    };

    const order = await razorpay.orders.create(options);

    return {
      statusCode: 200,
      body: JSON.stringify({
        key: process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
      }),
    };
  } catch (error) {
    console.error("Create Order Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
