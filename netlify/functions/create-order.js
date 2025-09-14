/ netlify/functions/create-order.js
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { name, mobile, email, vehicle } = JSON.parse(event.body);

  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

  try {
    const resp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 24900, // ₹249 in paise
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { name, mobile, email, vehicle },
      }),
    });

    const data = await resp.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        order_id: data.id,
        key: RAZORPAY_KEY_ID,
        amount: 24900,
        currency: "INR",
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: "Order creation failed" };
  }
};

