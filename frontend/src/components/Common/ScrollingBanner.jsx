import React from "react";

const ScrollingBanner = () => {
  return (
    <div className="scroll-container">
      <div className="scroll-track">
        <div className="scroll-content">
          {Array(20).fill("SHIPPING WORLDWIDE").map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
        <div className="scroll-content">
          {Array(20).fill("SHIPPING WORLDWIDE").map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
      </div>
    </div>
  );
};



export default ScrollingBanner;

