import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from "react-icons/hi2";
import SearchBar from "./SearchBar";
import CardDrawer from "../Layout/CartDrawer";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const { cart } = useSelector((state) => state.cart);
  const {user} = useSelector((state) => state.auth)

  const cartItemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) ||
    0;

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  };

  const toggleCardDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <nav className="container bg-[#efefef] rubik mx-auto flex items-center justify-between py-4 px-6">
        {/* left - logo */}
        <div>
          <Link to="/" className="text-2xl font-medium">
            KIXOR
          </Link>
        </div>
        {/* center - navigation links */}
        <div className="hidden md:flex space-x-6">
          <Link
            to="/collections/all"
            className="text-white-700 hover:text-gray-700 text-sm font-medium uppercase"
          >
            POLOS
          </Link>
          <Link
            to="/collections/all"
            className="text-white-700 hover:text-gray-700 text-sm font-medium uppercase"
          >
            SHIRTS
          </Link>
          <Link
            to="/collections/all?category=Top Wear"
            className="text-white-700 hover:text-gray-700 text-sm font-medium  uppercase"
          >
            TSHIRTS
          </Link>
          {/* <Link
            to="/collections/all?category=Bottom Wear"
            className="text-white-700 hover:text-gray-700 text-sm font-medium uppercase"
          >
            Bottom Wear
          </Link> */}
        </div>
        {/* right - icons */}
        <div className="flex items-center space-x-4">
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="block bg-black px-2 py-1 text-center rounded text-sm text-white"
            >
              Admin
            </Link>
          )}

          <Link to="/profile" className="hover:text-gray-700">
            <HiOutlineUser className="h-6 w-6 text-white-700" />
          </Link>
          <button
            onClick={toggleCardDrawer}
            className="relative hover:text-gray-700"
          >
            <HiOutlineShoppingBag className="h-6 w-6 text-white-700" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 bg-amber-600 text-white text-xs rounded-full px-2 py-0.5">
                {cartItemCount}
              </span>
            )}
          </button>
          {/* serach */}
          <div className="overflow-hidden">
            <SearchBar />
          </div>
          <button onClick={toggleNavDrawer} className="md:hidden ">
            <HiBars3BottomRight className="h-6 w-6 text-white-700" />
          </button>
        </div>
      </nav>
      <CardDrawer drawerOpen={drawerOpen} toggleCardDrawer={toggleCardDrawer} />

      {/* Mobile navigation */}
      <div
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 h-full bg-[#efefef] shadow-lg transform
        transition-transform duration-300 z-50 md:hidden sm:hidden ${
          navDrawerOpen ? "translate-x-0" : "translate-x-200"
        }`}
      >
        <div className="flex justify-end p-4">
          <button onClick={toggleNavDrawer}>
            <IoMdClose className="h-6 w-6 text-white-600" />
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <nav className="space-y-4">
            <Link
              to="/collections/all"
              onClick={toggleNavDrawer}
              className="block text-white-600 hover:text-gray-700"
            >
              POLOS
            </Link>
            <Link
              to="/collections/all"
              onClick={toggleNavDrawer}
              className="block text-white-600 hover:text-gray-700"
            >
              SHIRTS
            </Link>
            <Link
              to="/collections/all"
              onClick={toggleNavDrawer}
              className="block text-white-600 hover:text-gray-700"
            >
              TSHIRTS
            </Link>
            {/* <Link
              to="/collections/all?category=Bottom Wear"
              onClick={toggleNavDrawer}
              className="block text-white-600 hover:text-gray-700"
            >
              Bottom Wear
            </Link> */}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
