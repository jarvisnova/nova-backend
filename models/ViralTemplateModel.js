// File: /models/ViralTemplateModel.js

const mongoose = require("mongoose");

const viralTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  previewImage: {
    type: String, // URL to preview image
    required: true,
  },
  templateCode: {
    type: String, // JSON or config string to reproduce template
    required: true,
  },
  tags: [String], // like ["bhabhi", "funny", "drama"]
  is18plus: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: String, // can be "system" or user ID
    default: "system",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ViralTemplate = mongoose.model("ViralTemplate", viralTemplateSchema);

module.exports = ViralTemplate;

