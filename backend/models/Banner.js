const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  altText: { type: String, default: "" },
});

const bannerSchema = new mongoose.Schema(
  {
    desktop: {
      type: imageSchema,
      required: true,
    },
    mobile: {
      type: imageSchema,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Banner = mongoose.model("Banner", bannerSchema);

module.exports =  Banner;
