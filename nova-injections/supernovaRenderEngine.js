const fs = require("fs");
const path = require("path");

/**
 * Save rendered video and return metadata.
 * Called after client rendering completes.
 */
const saveRenderedVideo = async ({ title, downloadURL, duration, format = "mp4", sizeMB }) => {
  try {
    const id = Date.now().toString();
    const filename = `${title.replace(/\s+/g, "_").toLowerCase()}_${id}.${format}`;
    const savePath = path.join(__dirname, "..", "public", "renders", filename);

    // Simulate saving video to disk (In real case, you may fetch it from S3 or downloadURL)
    fs.writeFileSync(savePath, "FAKE_VIDEO_CONTENT");

    return {
      success: true,
      filename,
      downloadURL: `/renders/${filename}`,
      duration,
      sizeMB,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error saving rendered video:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Simulate a video render trigger (just logs and responds for now)
 */
const triggerRenderJob = async ({ templateId, voiceStyle, script, duration }) => {
  try {
    console.log("🎬 Triggering new render with:", { templateId, voiceStyle, script });

    // Simulated response
    return {
      success: true,
      renderId: `render_${Date.now()}`,
      estimatedTime: duration || 15,
      status: "queued",
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = {
  saveRenderedVideo,
  triggerRenderJob,
};

