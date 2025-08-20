const Template = require("../models/ViralTemplateModel");

// Save a new viral template (used by admin or after a render is marked viral)
exports.saveViralTemplate = async (req, res) => {
  try {
    const { name, tags, mode, scene, is18, creator } = req.body;

    const newTemplate = new Template({
      name,
      tags,
      mode,
      scene,
      is18,
      creator,
    });

    await newTemplate.save();
    res.status(200).json({ success: true, message: "Template saved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to save template", error: err });
  }
};

// Get all viral templates (to show in frontend for clone button)
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching templates", error: err });
  }
};

// Clone a viral template (used when user clicks "Use This Template")
exports.cloneTemplate = async (req, res) => {
  try {
    const { templateId, user } = req.body;
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ success: false, message: "Template not found" });

    // Return template data to frontend for prefill
    res.status(200).json({
      success: true,
      template: {
        tags: template.tags,
        mode: template.mode,
        scene: template.scene,
        is18: template.is18,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Clone failed", error: err });
  }
};

