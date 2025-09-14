// netlify/functions/verify-payment.js

const crypto = require("crypto");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // Signature verify karna
    const hmac = crypto.createHmac("sha256", key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const digest = hmac.digest("hex");

    if (digest === razorpay_signature) {
      // Voucher code generate karna
      const voucher = "FV-" + Math.random().toString(36).substr(2, 8).toUpperCase();

      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, voucher }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "Invalid signature" }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message }),
    };
  }
};
