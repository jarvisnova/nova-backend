const fs = require("fs");
const path = require("path");

// Main Scene Generator Logic
exports.generateBhabhiScene = async (req, res) => {
  try {
    const { category, outfit, mood, location, dialogueStyle } = req.body;

    if (!category || !outfit || !mood || !location || !dialogueStyle) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fantasy Generator Logic (basic simulation)
    const scene = `
      🌶️ Bold Bhabhi Fantasy Scene 🌶️

      Category: ${category}
      Outfit: ${outfit}
      Mood: ${mood}
      Location: ${location}
      Dialogue Style: ${dialogueStyle}

      Scene:
      A stunning, mature bhabhi wearing a ${outfit}, standing in the ${location}, eyes full of ${mood}. She slowly looks towards you and says in a ${dialogueStyle} voice...

      "Aapko mujhse kuchh chahiye tha na...? Toh fir ruk kyun gaye..."

      🔥 The tension builds as she comes closer...
    `;

    // Optionally save to a temp file (for later download if needed)
    const outputPath = path.join(__dirname, "../generated/bhabhi_scene.txt");
    fs.writeFileSync(outputPath, scene);

    res.status(200).json({
      success: true,
      message: "Bhabhi scene generated",
      scene,
    });
  } catch (err) {
    console.error("Scene Gen Error:", err);
    res.status(500).json({ error: "Failed to generate scene" });
  }
};

