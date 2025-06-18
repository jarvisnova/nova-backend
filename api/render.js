export default function handler(req, res) {
  if (req.method === 'POST') {
    res.status(200).json({
      success: true,
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
    });
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
