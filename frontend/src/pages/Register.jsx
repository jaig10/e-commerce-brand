import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import register from "../assets/register.webp";
import { registerUser } from "../redux/slice/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { mergeCart } from "../redux/slice/cartSlice";
import { toast } from "react-hot-toast";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId, loading } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const [touched, setTouched] = useState({
  name: false,
  email: false,
  password: false,
});

const getNameError = () => {
  if (!touched.name) return "";
  if (name.trim() === "") return "Name is required";
  return "";
};

const getEmailError = () => {
  if (!touched.email) return "";
  if (!isEmailValid(email)) return "Invalid email format";
  return "";
};

const getPasswordError = () => {
  if (!touched.password) return "";
  if (!isPasswordStrong(password)) {
    return "Password must be at least 6 characters, with one uppercase letter and one number";
  }
  return "";
};

  const isEmailValid = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isPasswordStrong = (password) =>
  /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);

  const isFormValid =
  name.trim() !== "" &&
  isEmailValid(email) &&
  isPasswordStrong(password);


  //Get redirect parameter and check if it's checkout ro soemthing
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    if (user) {
      if (cart?.products.length > 0 && guestId) {
        dispatch(mergeCart({ guestId, user })).then(() => {
          navigate(isCheckoutRedirect ? "/checkout" : "/");
        });
      } else {
        navigate(isCheckoutRedirect ? "/checkout" : "/");
      }
    }
  }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch]);

  const handleSumbmit = (e) => {
  e.preventDefault();

  if (name.trim() === "") {
    toast.error("Name is required");
    return;
  }

  if (!isEmailValid(email)) {
    toast.error("Please enter a valid email address");
    return;
  }

  if (!isPasswordStrong(password)) {
    toast.error(
      "Password must be at least 6 characters, with one uppercase letter and one numeric value"
    );
    return;
  }

  dispatch(registerUser({ name, email, password }));
};

  return (
    <div className="flex">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
        <form
          onSubmit={handleSumbmit}
          className="w-full max-w-md bg-[#efefef] p-8 rounded-lg border shadow-sm"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-medium">Kixor</h2>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Hey there!</h2>
          <p className="text-center mb-6">
            Enter your details to create an account
          </p>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              className="w-full p-2 border rounded"
              placeholder="Enter your full name"
            />
            {getNameError() && (
              <p className="text-red-500 text-sm mt-1">{getNameError()}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              className="w-full p-2 border rounded"
              placeholder="Enter your email address"
            />
            {getEmailError() && (
              <p className="text-red-500 text-sm mt-1">{getEmailError()}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setTouched((prev) => ({ ...prev, password: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              className="w-full p-2 border rounded"
              placeholder="Enter your Password"
            />
            {getPasswordError() && (
              <p className="text-red-500 text-sm mt-1">{getPasswordError()}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full p-2 rounded-lg font-semibold transition ${
              isFormValid && !loading
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>

          <p className="mt-6 text-center text-sm">
            Have an account?{" "}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-blue-500"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="h-full flex flex-col justify-center items-center">
          <img
            src={register}
            alt="Login ro Account"
            className="h-[750px] w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
