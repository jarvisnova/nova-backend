const express = require('express');
const router = express.Router();
const { generateBhabhiScene } = require('../controllers/bhabhiSceneController');

// POST route to generate bold bhabhi scene
router.post('/generate', generateBhabhiScene);

module.exports = router;

