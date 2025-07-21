const Razorpay = require("razorpay");

console.log("RAZORPAY_secret:", process.env.RAZORPAY_SECRET_KEY);
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_KEY_ID:", process.env.JWT_SECRET);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});


module.exports = razorpay;