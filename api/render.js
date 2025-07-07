const express = require('express');
const router = express.Router();

// POST /api/render
router.post('/render', async (req, res) => {
  try {
    const { scene } = req.body;

    if (!scene || scene.trim() === "") {
      return res.status(400).json({ success: false, message: "Scene is required" });
    }

    console.log("🎬 Render request received:", scene);

    // MOCK VIDEO LINK – replace with real render output later
    const sampleVideo = "https://cdn.pixabay.com/video/2022/11/28/140168-776410511_large.mp4";

    // Simulate delay to mimic rendering process
    setTimeout(() => {
      res.status(200).json({
        success: true,
        message: "Render started successfully",
        videoUrl: sampleVideo
      });
    }, 2000);

  } catch (err) {
    console.error("❌ Render Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
