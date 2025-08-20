const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.post('/upload/final-zip', uploadController.handleUpload);

module.exports = router;

