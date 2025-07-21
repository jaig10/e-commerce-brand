const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const razorpay = require("../utils/razorpay");
const crypto = require("crypto");

const router = express.Router();

//@route POST /api/checkout
//@desc Create a new checkout session
//@access Private

router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } =
    req.body;

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ message: "No items in checkout" });
  }
  try {
    //Create a new checkout session
    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems: checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });
    console.log(`Checkout created for user: ${req.user._id}`);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error("Error Creating checkout session", error);
    res.status(500).json({ message: "Server Error" });
  }
});

//@route PUT /api/checkout/:id/pay
//@desc Update checkout to mark as pais after successful payment
//@desc Private

// router.put("/:id/pay", protect, async (req, res) => {
//   const { paymentStatus, paymentDetails } = req.body;

//   try {
//     const checkout = await Checkout.findById(req.params.id);

//     if (!checkout) {
//       return res.status(404).json({ message: "Checkout not found." });
//     }

//     if (paymentStatus === "paid") {
//       checkout.isPaid = true;
//       checkout.paymentStatus = paymentStatus;
//       checkout.paymentDetails = paymentDetails;
//       checkout.paidAt = Date.now();
//       await checkout.save();

//       res.status(200).json(checkout);
//     } else {
//       res.status(400).json({ message: "Invalid Payment Status" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// });
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentDetails, razorpay_signature } = req.body;

  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "Checkout ID is missing" });
    }
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout)
      return res.status(404).json({ message: "Checkout not found" });

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(
        paymentDetails.razorpay_order_id +
          "|" +
          paymentDetails.razorpay_payment_id
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid Razorpay signature" });
    }

    checkout.isPaid = true;
    checkout.paymentStatus = paymentStatus;
    checkout.paymentDetails = paymentDetails;
    checkout.paidAt = Date.now();

    await checkout.save();
    res.status(200).json(checkout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//@route POST /api/checkout/:id/finalize
//@desc Finalzie checkout and convert to an order after payment confirmation
//@access Private

router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found." });
    }

    if (checkout.isPaid && !checkout.isFinalized) {
      //Create final order based on the checkout details
      const finalOrder = await Order.create({
        user: checkout.user,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: checkout.paymentDetails,
      });
      //Mark the checkout as finalized
      checkout.isFinalized = true;
      checkout.finalizedAt = Date.now();
      await checkout.save();
      // Delete the cart associated with the user
      await Cart.findOneAndDelete({ user: checkout.user });
      res.status(201).json(finalOrder);
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout Already finalized" });
    } else {
      res.status(400).json({ message: "Checkout is not paid" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/:id/create-razorpay-order", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout)
      return res.status(404).json({ message: "Checkout not found" });

    const options = {
      amount: checkout.totalPrice * 100,
      currency: "INR",
      receipt: `rcpt_${checkout._id}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

module.exports = router;
