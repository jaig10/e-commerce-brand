import React from "react";
import {
  HiArrowPathRoundedSquare,
  HiOutlineCreditCard,
  HiShoppingBag,
} from "react-icons/hi2";

import { FaBagShopping } from "react-icons/fa6";
import { IoIosCard } from "react-icons/io";
import { RiLoopRightFill } from "react-icons/ri";

const FeaturesSection = () => {
  return (
    <section className="pt-16 pb-24 px-4 bg-[#efefef]">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {/* features */}
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-full mb-4">
            <FaBagShopping className="text-3xl" />
          </div>
          <h4 className="tracking-tighter mb-2">FREE PAN INDIA SHIPPING</h4>
          <p className="text-gray-600 text-sm tracking-tighter">
            ON ALL ORDERS ABOVE RS.1000.00
          </p>
        </div>
        {/* features 2*/}
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-full mb-4">
            <RiLoopRightFill className="text-3xl" />
          </div>
          <h4 className="tracking-tighter mb-2">45 DAYS RETURN</h4>
          <p className="text-gray-600 text-sm tracking-tighter">
            MONEY BACK GUARANTEE
          </p>
        </div>
        {/* features 3*/}
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-full mb-4">
            <IoIosCard className="text-3xl" />
          </div>
          <h4 className="tracking-tighter mb-2">SECURE CHECKOUT</h4>
          <p className="text-gray-600 text-sm tracking-tighter">
            100% SECURED CHECKOUT PROCESS
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
