import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative w-full min-h-[40vh] overflow-hidden">
      <picture className="block w-full h-full">
        <source
          media="(max-width: 768px)"
          srcSet="/images/BannerMobile.png"
        />
        <img
          src="/images/Kixor.jpg"
          alt="Hero Banner"
          className="w-full h-full object-cover block"
        />
      </picture>
    </section>

  );
};

export default Hero;
