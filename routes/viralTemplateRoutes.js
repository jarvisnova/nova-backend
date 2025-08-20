// File: /routes/viralTemplateRoutes.js

const express = require("express");
const router = express.Router();
const {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  deleteTemplate,
} = require("../controllers/viralTemplateController");

// Create a new viral template
router.post("/create", createTemplate);

// Get all templates (can filter 18+ later)
router.get("/all", getAllTemplates);

// Get single template by ID
router.get("/:id", getTemplateById);

// Delete a template (admin/founder only)
router.delete("/:id", deleteTemplate);

module.exports = router;

