// netlify/functions/verify-payment.js

const crypto = require("crypto");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Signature verify karna
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(razorpay_order_id + "|" + razorpay_payment_id);
    const digest = shasum.digest("hex");

    if (digest === razorpay_signature) {
      // Random voucher code generate karo
      const voucher = "FV-" + Math.random().toString(36).substr(2, 6).toUpperCase();

      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          voucher: voucher,
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          error: "Invalid signature",
        }),
      };
    }
  } catch (error) {
    console.error("Error in verify-payment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
