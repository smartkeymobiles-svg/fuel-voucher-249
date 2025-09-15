// netlify/functions/verify-payment.js

const Razorpay = require("razorpay");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");

// SendGrid API key (Netlify env variable)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const { 
      name, 
      email, 
      mobile, 
      vehicle, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = body;

    // Step 1: Verify Razorpay Signature
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(razorpay_order_id + "|" + razorpay_payment_id);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      // ❌ Payment verification failed
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "Payment verification failed" }),
      };
    }

    // ✅ Step 2: Only if verified, generate voucher code
    const voucher = "FV-" + Math.random().toString(36).substr(2, 8).toUpperCase();

    // Step 3: Send Email with Voucher
    const msg = {
      to: email, // customer email
      from: "indianoilvouchers@gmail.com", // your sender email
      subject: "Your Indian Oil Fuel Voucher",
      html: `
        <h2>Hi ${name},</h2>
        <p>🎉 Thank you for your payment of ₹249.</p>
        <p>Your <strong>Fuel Voucher Code</strong> is:</p>
        <h1 style="color:green;">${voucher}</h1>
        <p>Vehicle Number: ${vehicle}</p>
        <p>Mobile: ${mobile}</p>
        <p>💡 Show this voucher code at Indian Oil petrol pumps to redeem ₹1200 worth of fuel.</p>
        <br>
        <p>Regards,<br>Fuel Voucher Team</p>
      `,
    };

    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, voucher }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message }),
    };
  }
};
