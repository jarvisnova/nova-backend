const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Triggered when user starts a render from frontend
const handleRender = async (req, res) => {
  try {
    const { userId, mode, templateId, content } = req.body;

    // Create unique ID for render session
    const renderId = uuidv4();

    // Simulate Render Logic (replace with actual render call if needed)
    const renderOutput = {
      renderId,
      userId,
      mode,
      templateId,
      content,
      status: "rendering",
      startTime: new Date(),
    };

    // Save temp JSON log (optional)
    const tempPath = path.join(__dirname, "../temp", `${renderId}.json`);
    fs.writeFileSync(tempPath, JSON.stringify(renderOutput, null, 2));

    return res.status(200).json({
      success: true,
      message: "Render triggered successfully",
      renderId,
    });
  } catch (error) {
    console.error("Render trigger failed:", error);
    return res.status(500).json({
      success: false,
      message: "Error triggering render",
    });
  }
};

// Called from RunPod webhook or manual frontend after rendering is complete
const handleRenderComplete = async (req, res) => {
  try {
    const { renderId, videoUrl, duration, size, mode, userId } = req.body;

    const savedData = {
      renderId,
      videoUrl,
      duration,
      size,
      mode,
      userId,
      completedAt: new Date(),
    };

    // Save to temp folder or database (currently just JSON for testing)
    const savePath = path.join(__dirname, "../renders", `${renderId}.json`);
    fs.writeFileSync(savePath, JSON.stringify(savedData, null, 2));

    // Here you can also trigger:
    // - Coin deduction logic
    // - Auto-Coach mode AI feedback
    // - Notifications to user
    // - Reel conversion job
    // - etc.

    return res.status(200).json({
      success: true,
      message: "Render completed and saved successfully",
      data: savedData,
    });
  } catch (error) {
    console.error("Saving render failed:", error);
    return res.status(500).json({
      success: false,
      message: "Error saving render",
    });
  }
};

module.exports = {
  handleRender,
  handleRenderComplete,
};

