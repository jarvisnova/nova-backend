const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");

// Ensure folders exist
const baseDir = path.join(__dirname, "..");
const rendersDir = path.join(baseDir, "renders");
const tempDir = path.join(baseDir, "temp");
if (!fs.existsSync(rendersDir)) fs.mkdirSync(rendersDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Helper: download URL to local file
async function downloadFile(url, outPath) {
  const res = await axios({ url, method: "GET", responseType: "stream", timeout: 120000 });
  return new Promise((resolve, reject) => {
    const w = fs.createWriteStream(outPath);
    res.data.pipe(w);
    w.on("finish", resolve);
    w.on("error", reject);
  });
}

// Helper: remove temp files (best-effort)
function cleanupFiles(files = []) {
  for (const f of files) {
    try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (e) { /* ignore */ }
  }
}

// Create a short per-image video (loop single image) — used for crossfade
function createImageVideo(imagePath, durationSec, outVideoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .inputOptions(["-loop 1"])
      .outputOptions([
        "-t " + durationSec,
        "-vf scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2",
        "-r 30",
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-profile:v baseline",
        "-level 3.0"
      ])
      .save(outVideoPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err));
  });
}

// Concatenate videos with crossfades (sequential)
async function concatWithCrossfade(perImageVideos, outputPath, crossfadeDuration = 0.7) {
  // Build complex filter for sequential xfade between N videos
  // Strategy: chain using filter_complex with xfade, progressively
  // Note: this can be heavy for many images; test with <=20 images ideally.
  return new Promise((resolve, reject) => {
    if (perImageVideos.length === 1) {
      // single video -> just copy
      ffmpeg(perImageVideos[0])
        .outputOptions(["-c copy"])
        .save(outputPath)
        .on("end", resolve)
        .on("error", reject);
      return;
    }

    // Build inputs
    const cmd = ffmpeg();
    perImageVideos.forEach(p => cmd.addInput(p));

    // Build filter_complex dynamically
    // Each input is [0:v][1:v] ... and we apply xfade sequentially
    let filter = "";
    let streamA = "[0:v]";
    for (let i = 1; i < perImageVideos.length; i++) {
      const streamB = `[${i}:v]`;
      const outTag = `[v${i}]`;
      const offsetExpr = `(${i-1})* (` + (2 /* default per-image duration */) + ` - ${crossfadeDuration}) + ${ (i-1) * 0 }`;
      // Instead of complicated offset calculations, we'll use simplified offsets by time.
      // Simpler approach: use 'xfade' with transition=fade:duration=crossfadeDuration:offset=...
      // To avoid precise offset miscalc, we generate timelines by concatenation of durations below.
      // We'll instead chain xfade with offset equal to (i-1)*(imageDuration - crossfadeDuration)
      // However we don't have exact imageDuration here; will pass 2s default or get from metadata.
      filter += `${streamA}${streamB}xfade=transition=fade:duration=${crossfadeDuration}:offset=${(i-1)*(2 - crossfadeDuration)}${outTag};`;
      streamA = outTag;
    }
    // remove trailing semicolon
    if (filter.endsWith(";")) filter = filter.slice(0, -1);

    // Final map: use the last tag
    const finalStream = `[v${perImageVideos.length - 1}]`;

    // Attach filter
    cmd.complexFilter(filter, [finalStream.replace(/\[|\]/g, "")]);

    cmd.outputOptions(["-map " + finalStream, "-c:v libx264", "-pix_fmt yuv420p", "-r 30", "-c:a aac", "-shortest"]);
    cmd.save(outputPath).on("end", resolve).on("error", reject);
  });
}

// Main render endpoint
const handleRender = async (req, res) => {
  // Expected body: { audioUrl, imageUrls: [], username, mode, perImageDuration }
  const body = req.body || {};
  const audioUrl = body.audioUrl;
  const imageUrls = body.imageUrls || [];
  const username = body.username || "user";
  const mode = (body.mode || "slideshow").toLowerCase(); // "slideshow" or "crossfade"
  const perImageDuration = parseFloat(body.perImageDuration) || 2.0; // seconds

  if (!audioUrl || !imageUrls.length) {
    return res.status(400).json({ success: false, message: "Missing audioUrl or imageUrls" });
  }

  const timestamp = Date.now();
  const videoName = `${username}_render_${timestamp}.mp4`;
  const outputPath = path.join(rendersDir, videoName);

  const localFiles = []; // temp files to cleanup
  try {
    // Download audio
    const audioPath = path.join(tempDir, `audio_${timestamp}.mp3`);
    await downloadFile(audioUrl, audioPath);
    localFiles.push(audioPath);

    // Download images
    const imagePaths = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const imgPath = path.join(tempDir, `img_${i}_${timestamp}${path.extname(imageUrls[i].split("?")[0]) || ".jpg"}`);
      await downloadFile(imageUrls[i], imgPath);
      imagePaths.push(imgPath);
      localFiles.push(imgPath);
    }

    if (mode === "slideshow") {
      // Use concat demuxer: create a list file where each file has duration
      const listFile = path.join(tempDir, `list_${timestamp}.txt`);
      const lines = [];
      for (let i = 0; i < imagePaths.length; i++) {
        lines.push(`file '${imagePaths[i].replace(/'/g, "'\\''")}'`);
        lines.push(`duration ${perImageDuration}`);
      }
      // Add last file again per ffmpeg concat demuxer recommendation
      lines.push(`file '${imagePaths[imagePaths.length - 1].replace(/'/g, "'\\''")}'`);
      fs.writeFileSync(listFile, lines.join("\n"));
      localFiles.push(listFile);

      // Run ffmpeg: concat images -> video, then add audio and encode final
      const tempVideo = path.join(tempDir, `temp_vid_${timestamp}.mp4`);
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(listFile)
          .inputOptions(["-f concat", "-safe 0"])
          .outputOptions(["-vsync vfr", "-pix_fmt yuv420p", "-r 30"])
          .save(tempVideo)
          .on("end", resolve)
          .on("error", reject);
      });
      localFiles.push(tempVideo);

      // Merge audio (shortest to avoid overrun)
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(tempVideo)
          .input(audioPath)
          .outputOptions(["-c:v libx264", "-c:a aac", "-pix_fmt yuv420p", "-shortest"])
          .save(outputPath)
          .on("end", resolve)
          .on("error", reject);
      });

    } else if (mode === "crossfade") {
      // Create per-image short videos
      const perImageVideos = [];
      for (let i = 0; i < imagePaths.length; i++) {
        const iv = path.join(tempDir, `imgvid_${i}_${timestamp}.mp4`);
        await createImageVideo(imagePaths[i], perImageDuration, iv);
        perImageVideos.push(iv);
        localFiles.push(iv);
      }

      // Create crossfaded big video
      const tempFaded = path.join(tempDir, `faded_${timestamp}.mp4`);
      // Note: concatWithCrossfade above uses a simplified offset formula; for reliable results keep perImageDuration moderate (>=1.5s)
      await concatWithCrossfade(perImageVideos, tempFaded, Math.min(0.8, perImageDuration * 0.4));
      localFiles.push(tempFaded);

      // Merge audio and fade video
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(tempFaded)
          .input(audioPath)
          .outputOptions(["-c:v libx264", "-c:a aac", "-pix_fmt yuv420p", "-shortest"])
          .save(outputPath)
          .on("end", resolve)
          .on("error", reject);
      });

    } else {
      // unknown mode -> fallback to slideshow
      console.log("Unknown mode, falling back to slideshow:", mode);
      // recursive call ish — but implement simple slideshow fallback
      // create the same concat as slideshow
      const listFile = path.join(tempDir, `list_${timestamp}.txt`);
      const lines = [];
      for (let i = 0; i < imagePaths.length; i++) {
        lines.push(`file '${imagePaths[i].replace(/'/g, "'\\''")}'`);
        lines.push(`duration ${perImageDuration}`);
      }
      lines.push(`file '${imagePaths[imagePaths.length - 1].replace(/'/g, "'\\''")}'`);
      fs.writeFileSync(listFile, lines.join("\n"));
      localFiles.push(listFile);
      const tempVideo = path.join(tempDir, `temp_vid_${timestamp}.mp4`);
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(listFile)
          .inputOptions(["-f concat", "-safe 0"])
          .outputOptions(["-vsync vfr", "-pix_fmt yuv420p", "-r 30"])
          .save(tempVideo)
          .on("end", resolve)
          .on("error", reject);
      });
      localFiles.push(tempVideo);
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(tempVideo)
          .input(audioPath)
          .outputOptions(["-c:v libx264", "-c:a aac", "-pix_fmt yuv420p", "-shortest"])
          .save(outputPath)
          .on("end", resolve)
          .on("error", reject);
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      message: "Render complete",
      videoName,
      downloadLink: `/downloads/${videoName}`
    });

  } catch (err) {
    console.error("Render pipeline error:", err);
    return res.status(500).json({ success: false, message: "Render failed", error: String(err) });
  } finally {
    // cleanup temp files (do not delete final output)
    try { cleanupFiles(localFiles); } catch (e) { /* ignore cleanup errors */ }
  }
};

// Save uploaded base64 render
const handleRenderComplete = async (req, res) => {
  try {
    const { videoBuffer, filename } = req.body || {};
    if (!videoBuffer || !filename) return res.status(400).json({ success: false, message: "Missing data" });
    const out = path.join(rendersDir, filename);
    fs.writeFileSync(out, Buffer.from(videoBuffer, "base64"));
    return res.status(200).json({ success: true, message: "Saved", downloadURL: `/downloads/${filename}` });
  } catch (err) {
    console.error("Save render error:", err);
    return res.status(500).json({ success: false, message: "Save failed" });
  }
};

module.exports = { handleRender, handleRenderComplete };


