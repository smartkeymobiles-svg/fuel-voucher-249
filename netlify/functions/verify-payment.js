// netlify/functions/verify-payment.js
const crypto = require("crypto");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    name,
    email,
    mobile,
    vehicle,
  } = JSON.parse(event.body);

  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

  // Signature check
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, msg: "Invalid signature" }) };
  }

  // Voucher code generate
  const voucher = "FV-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  // TODO: Email/SMS bhejna (abhi simple response)
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, voucher }),
  };
};
