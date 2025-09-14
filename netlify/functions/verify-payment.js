// netlify/functions/verify-payment.js

const crypto = require("crypto");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Signature verification
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      // Payment verified ✅
      const voucherCode =
        "FV-" + Math.random().toString(36).substr(2, 8).toUpperCase();

      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, voucher: voucherCode }),
      };
    } else {
      // Payment failed ❌
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "Invalid signature" }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
