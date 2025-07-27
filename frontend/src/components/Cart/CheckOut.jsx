import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import PayPalButton from "./PayPalButton"; // Keep if you plan to use it later
import { useDispatch, useSelector } from "react-redux";
import { createCheckout } from "../../redux/slice/checkoutSlice";
import { clearBuyNowProduct } from "../../redux/slice/buyNowSlice";
// Import the centralized axios instance with interceptors
import api from "../../axios"; // Adjust this path to where you saved axiosInstance.js

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use distinct names for loading/error states from different slices
  const { cart: reduxCart, loading: cartLoading, error: cartError } = useSelector((state) => state.cart);
  const { user, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const { product: buyNowProduct } = useSelector((state) => state.buyNow);
  const { loading: checkoutLoading, error: checkoutError } = useSelector((state) => state.checkout); // Assuming checkoutSlice has these

  const [checkoutId, setCheckoutId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // State for client-side validation errors for shipping address
  const [addressErrors, setAddressErrors] = useState({});

  // Determine which cart to use (buyNowProduct takes precedence)
  const cart = buyNowProduct
    ? {
        products: [buyNowProduct],
        totalPrice: buyNowProduct.price * buyNowProduct.quantity,
      }
    : reduxCart;

  // Effect to redirect if cart is empty after initial load
  useEffect(() => {
    // Only redirect if not already in a loading state and the cart is definitively empty
    if (!cartLoading && (!cart || !cart.products || cart.products.length === 0)) {
      navigate("/");
    }
  }, [cart, navigate, cartLoading]);

  // Client-side validation for shipping address fields
  const validateShippingAddress = () => {
    const errors = {};
    if (!shippingAddress.firstName.trim()) errors.firstName = "First name is required.";
    if (!shippingAddress.lastName.trim()) errors.lastName = "Last name is required.";
    if (!shippingAddress.address.trim()) errors.address = "Address is required.";
    if (!shippingAddress.city.trim()) errors.city = "City is required.";
    if (!shippingAddress.postalCode.trim()) errors.postalCode = "Postal code is required.";
    if (!shippingAddress.country.trim()) errors.country = "Country is required.";
    if (!shippingAddress.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10,15}$/.test(shippingAddress.phone.trim())) { // Basic phone number regex (10-15 digits)
      errors.phone = "Invalid phone number format.";
    }

    setAddressErrors(errors); // Update error state
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleCreateCheckout = async (e) => {
    e.preventDefault();

    setIsProcessing(true); // Indicate processing has started

    // Pre-check for user login (redundant if interceptor handles, but good for immediate feedback)
    if (!user) {
      alert("Please log in to continue with your purchase.");
      setIsProcessing(false);
      navigate("/login?redirect=/checkout"); // Redirect to login, preserving current path
      return;
    }

    // Pre-check for empty cart
    if (!cart || cart.products.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      setIsProcessing(false);
      navigate("/"); // Redirect to home if cart is empty
      return;
    }

    // Client-side shipping address validation
    if (!validateShippingAddress()) {
      alert("Please correct the errors in your shipping address details.");
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Create Checkout record in backend
      const createCheckoutResult = await dispatch(
        createCheckout({
          checkoutItems: cart.products,
          shippingAddress,
          paymentMethod: "Razorpay", // Can be dynamic if you add other options
          totalPrice: cart.totalPrice,
        })
      );

      // Check if the Redux thunk action returned an error
      if (createCheckoutResult.meta.rejectedWithValue) {
      // Only alert for non-401 specific errors, as 401 is handled by interceptor redirect
      alert(`Checkout creation failed: ${createCheckoutResult.payload}`);
      setIsProcessing(false);
      return;
    }
    if (createCheckoutResult.error) {
      alert(`Checkout creation failed: ${createCheckoutResult.error.message || "Unknown error"}`);
      setIsProcessing(false);
      return;
    }

      const newCheckoutId = createCheckoutResult.payload._id;
      setCheckoutId(newCheckoutId); // Store checkout ID

      // 2. Create Razorpay Order
      // Use 'api' instance here so the interceptor handles token issues
      const { data: razorpayOrderData } = await api.post(
        `/api/checkout/${newCheckoutId}/create-razorpay-order`,
        {}
        // Headers handled by interceptor
      );

      // Check if Razorpay script is loaded
      if (typeof window.Razorpay === "undefined") {
        alert("Payment gateway script not loaded. Please ensure you have an active internet connection or try again later.");
        setIsProcessing(false);
        return;
      }

      // 3. Open Razorpay Payment Gateway
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your Razorpay Key ID
        amount: razorpayOrderData.amount, // Amount in smallest currency unit (e.g., paise)
        currency: razorpayOrderData.currency,
        name: "KIXOR",
        description: "Checkout Payment for KIXOR Order",
        order_id: razorpayOrderData.id, // Razorpay order ID
        handler: async function (response) {
          // This callback is executed upon successful payment
          await handlePaymentSuccess(
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
            },
            response.razorpay_signature,
            newCheckoutId
          );
          setIsProcessing(false); // Stop processing after successful payment flow
        },
        prefill: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: user?.email,
          contact: shippingAddress.phone,
        },
        theme: { color: "#000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      // Handle payment failure event from Razorpay dialog
      rzp.on("payment.failed", (response) => {
        console.error("Razorpay Payment Failed:", response.error);
        alert(`Payment failed: ${response.error?.description || "An error occurred during payment."}`);
        setIsProcessing(false); // Stop processing on payment failure
      });

    } catch (err) {
      console.error("Checkout process error:", err);
      // General error handling (e.g., 500 server error, network issues not caught by 401 interceptor)
      let errorMessage = "Something went wrong during checkout. Please try again.";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = `Error: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`; // Fallback to generic axios error message
      }
      alert(errorMessage);
      setIsProcessing(false); // Ensure processing ends on any error
    }
  };

  const handlePaymentSuccess = async (details, razorpay_signature, id) => {
    if (!id) {
      console.error("Missing checkout ID for payment success callback.");
      alert("An internal error occurred. Please contact support.");
      return;
    }

    try {
      // Update checkout status in backend (use 'api' here)
      await api.put(
        `/api/checkout/${id}/pay`,
        {
          paymentStatus: "paid", // Set payment status
          paymentDetails: details,
          razorpay_signature,
        }
        // Headers handled by interceptor
      );
      // Finalize checkout after payment is recorded
      await handleFinalizeCheckout(id);
    } catch (error) {
      console.error("Payment Confirmation Error:", error);
      let errorMessage = "Payment confirmation failed. Please try again.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = `Failed to confirm payment: ${error.response.data.message}`;
      }
      alert(errorMessage);
    }
  };

  const handleFinalizeCheckout = async (id) => {
    if (!id) {
      console.error("Missing checkout ID for finalizing order.");
      alert("An internal error occurred during order finalization. Please contact support.");
      return;
    }
    try {
      // Finalize the order (e.g., clear cart on backend, update inventory)
      await api.post(
        `/api/checkout/${id}/finalize`,
        {}
        // Headers handled by interceptor
      );
      dispatch(clearBuyNowProduct()); // Clear buy-now product if it was a direct purchase
      // Navigate to order confirmation page
      navigate("/order-confirmation");
    } catch (error) {
      console.error("Finalize checkout error:", error);
      let errorMessage = "There was an issue finalizing your order. Please contact support.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = `Order finalization failed: ${error.response.data.message}`;
      }
      alert(errorMessage);
    }
  };

  // Render logic for global loading and errors
  const overallLoading = cartLoading || authLoading || checkoutLoading || isProcessing;
  const overallError = cartError || authError || checkoutError; // Combine errors from different slices

  if (overallLoading) {
    return <p className="text-center py-10 text-xl">Loading checkout details...</p>;
  }

  if (overallError) {
    return <p className="text-center py-10 text-xl text-red-600">Error: {overallError}</p>;
  }

  // Final check for empty cart after all loading/error states are resolved
  if (!cart || !cart.products || cart.products.length === 0) {
    return <p className="text-center py-10 text-xl">Your cart is empty. Please add items to proceed to checkout.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
      <div className="bg-[#efefef] rounded-lg p-6">
        <h2 className="text-2xl uppercase mb-6 font-medium">Checkout</h2>
        <form onSubmit={handleCreateCheckout}>
          <h3 className="text-lg mb-4 font-medium">Contact Details</h3>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={user ? user.email : ""}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 cursor-not-allowed"
              disabled
            />
          </div>
          <h3 className="text-lg mb-4 font-medium">Delivery Address</h3>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-gray-700 text-sm font-semibold mb-1">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="firstName"
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, firstName: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {addressErrors.firstName && <p className="text-red-500 text-xs mt-1">{addressErrors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-gray-700 text-sm font-semibold mb-1">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="lastName"
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, lastName: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {addressErrors.lastName && <p className="text-red-500 text-xs mt-1">{addressErrors.lastName}</p>}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700 text-sm font-semibold mb-1">Address <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="address"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, address: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {addressErrors.address && <p className="text-red-500 text-xs mt-1">{addressErrors.address}</p>}
          </div>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-1">City <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="city"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, city: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {addressErrors.city && <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>}
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-gray-700 text-sm font-semibold mb-1">Postal Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="postalCode"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {addressErrors.postalCode && <p className="text-red-500 text-xs mt-1">{addressErrors.postalCode}</p>}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="country" className="block text-gray-700 text-sm font-semibold mb-1">Country <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="country"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, country: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {addressErrors.country && <p className="text-red-500 text-xs mt-1">{addressErrors.country}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-semibold mb-1">Phone <span className="text-red-500">*</span></label>
            <input
              type="tel" // Use type="tel" for phone numbers
              id="phone"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, phone: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {addressErrors.phone && <p className="text-red-500 text-xs mt-1">{addressErrors.phone}</p>}
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              disabled={overallLoading} // Disable if any loading is happening
            >
              {isProcessing ? "Processing Payment..." : "Continue to Payment"}
            </button>
          </div>
        </form>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-2xl uppercase mb-6 font-medium">Order Summary</h3>
        <div className="border-t border-b border-gray-300 py-4 mb-4">
          {cart.products.map((product, index) => (
            <div key={product._id || index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
              <div className="flex items-center">
                <img
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-24 h-28 object-cover rounded-md mr-4 shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <p className="text-gray-600 text-sm">Quantity: {product.quantity}</p>
                  <p className="text-gray-600 text-sm">Size: {product.size}</p>
                  <p className="text-gray-600 text-sm">Color: {product.color}</p>
                </div>
              </div>
              <p className="text-xl font-semibold text-gray-800">
                ${(product.price * product.quantity)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center text-lg mb-3">
          <p className="text-gray-700">Subtotal</p>
          <p className="font-medium text-gray-800">${cart.totalPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="flex justify-between items-center text-lg mb-6">
          <p className="text-gray-700">Shipping</p>
          <p className="font-medium text-gray-800">Free</p>
        </div>
        <div className="flex justify-between items-center text-2xl font-bold mt-4 border-t pt-4 border-gray-300">
          <p className="text-gray-900">Total</p>
          <p className="text-gray-900">${cart.totalPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;