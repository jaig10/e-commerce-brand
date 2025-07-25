import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative w-full h-[90vh] lg:h-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className=" w-full h-full object-cover z-[-1]"
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      {/* <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <h1 className="text-4xl md:text-9xl font-bold tracking-tighter uppercase mb-4">
            Vacation <br />Ready
          </h1>
          <p className="text-sm tracking-tighter md:text-lg mb-6">
            Explore our vacation-ready outfits with fast worldwide shipping.
          </p>
          <Link
            to="/collections/all"
            className="bg-[#efefef] text-gray-950 hover:bg-gray-950 hover:text-white duration-300 transition-all px-6 py-2 rounded-sm text-lg"
          >
            Shop Now
          </Link>
        </div>
      </div> */}
    </section>
  );
};

export default Hero;
