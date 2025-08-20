const fs = require("fs");
const path = require("path");

// MAIN: Triggered when render finishes
const handleRenderComplete = async (req, res) => {
  try {
    const { renderId, userId, tagsUsed, duration, outputPath } = req.body;

    // 1. Save Render Info (optional: DB logic)
    console.log(`✅ Render complete: ${renderId} for user ${userId}`);

    // 2. Auto-Coach Mode: give smart feedback
    const feedback = generateAutoCoachFeedback(tagsUsed, duration);

    // 3. Respond with feedback and download path
    return res.status(200).json({
      success: true,
      message: "Render complete.",
      feedback,
      downloadUrl: `/downloads/${path.basename(outputPath)}`,
    });
  } catch (err) {
    console.error("❌ Render Completion Error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// COACH: Logic to give smart feedback based on scene tags and time
function generateAutoCoachFeedback(tags = [], duration = 0) {
  const score = Math.min(100, (tags.length * 10) + (duration > 10 ? 20 : 5));
  const suggestions = [];

  if (!tags.includes("bhabhi") && !tags.includes("romance")) {
    suggestions.push("Try adding more bold or emotional tags for virality.");
  }

  if (duration < 6) {
    suggestions.push("Video is too short — ideal length is 7–15 seconds.");
  } else if (duration > 25) {
    suggestions.push("Too long — shorter videos go more viral.");
  }

  if (tags.includes("slowmo") && tags.includes("emotional")) {
    suggestions.push("Nice combo! Add a trending reel audio next time.");
  }

  return {
    coachScore: score,
    tips: suggestions,
    finalTip: "Try using presets from Viral Templates next time for better output.",
  };
}

// Render Trigger — just placeholder for now
const handleRender = async (req, res) => {
  return res.status(200).json({ success: true, message: "Render started (stub)." });
};

module.exports = {
  handleRenderComplete,
  handleRender
};


