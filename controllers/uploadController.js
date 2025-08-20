const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

exports.handleUpload = async (req, res) => {
  try {
    const { filename } = req.body;
    const filePath = path.join(__dirname, '..', 'uploads', `${filename}.mp4`);
    const zipPath = path.join(__dirname, '..', 'zips', `${filename}.zip`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'MP4 file not found' });
    }

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const finalLink = `https://jarvishai.com/zips/${filename}.zip`;
      return res.status(200).json({ success: true, downloadLink: finalLink });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.file(filePath, { name: `${filename}.mp4` });
    archive.finalize();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

