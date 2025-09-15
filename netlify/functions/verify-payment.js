// netlify/functions/verify-payment.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, name } = body;

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(razorpay_order_id + "|" + razorpay_payment_id);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return { statusCode: 400, body: JSON.stringify({ ok: false }) };
    }

    // Email to customer
    const msg = {
      to: email,
      from: "indianoilvouchers@gmail.com",
      subject: "Fuel Voucher Purchase - Processing",
      text: `Hello ${name},\n\nThank you for your payment. Your voucher code will be generated in 24–48 hours and sent to your email.\n\nRegards,\nFuel Voucher Team`,
    };

    await sgMail.send(msg);

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
