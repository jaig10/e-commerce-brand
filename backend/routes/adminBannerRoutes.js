const express = require("express");
const Banner =  require("../models/Banner.js");
const { protect } = require( "../middleware/authMiddleware.js");

const router = express.Router();

// GET /api/banner
const getActiveBanner = async (req, res) => {
    try {
        const banner = await Banner.findOne(); // Only one banner allowed
        if (!banner) {
            return res.status(404).json({ message: "No banner found" });
        }
        res.json(banner);
    } catch (error) {
        console.error("Error fetching banner:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/banner
const createOrUpdateBanner = async (req, res) => {
  try {
    const { desktop, mobile } = req.body;
    
    if (!desktop?.url || !mobile?.url) {
        return res
        .status(400)
        .json({ message: "Desktop and Mobile banner URLs are required" });
    }
    
    let banner = await Banner.findOne();
    if (banner) {
        banner.desktop = desktop;
        banner.mobile = mobile;
        await banner.save();
        res.json({ message: "Banner updated", banner });
    } else {
        const newBanner = await Banner.create({ desktop, mobile });
        res.status(201).json({ message: "Banner created", banner: newBanner });
    }
} catch (error) {
    console.error("Error saving banner:", error);
    res.status(500).json({ message: "Server error" });
}
};

// Public (you can make it protected if needed)
router.get("/", getActiveBanner);

// Admin only
router.post("/", protect, createOrUpdateBanner);

module.exports = router;