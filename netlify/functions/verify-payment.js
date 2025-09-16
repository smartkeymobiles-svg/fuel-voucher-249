// netlify/functions/verify-payment.js
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");

// Set SendGrid API Key from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const body = JSON.parse(event.body);

    const sign = body.razorpay_order_id + "|" + body.razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (body.razorpay_signature === expectedSign) {
      // Send email to customer
      const msg = {
        to: body.email,
        from: "indianoilvouchers@gmail.com", // तुमने जो email दी थी
        subject: "Fuel Voucher Purchase Confirmation",
        text: `Hi ${body.name},\n\nYour payment was successful. Your voucher code will be generated within 24-48 hours and sent to your email.\n\nRegards,\nFuel Voucher Team`,
      };

      await sgMail.send(msg);

      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          message: "Payment verified. Voucher will be sent in 24-48 hours.",
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, message: "Invalid signature" }),
      };
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
