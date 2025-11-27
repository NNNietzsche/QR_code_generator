// server.js
const express = require('express');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON body
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API: generate QR code
app.post('/api/qrcode', async (req, res) => {
  const { url, colorDark, colorLight, size } = req.body || {};

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'URL不能为空 / URL is required.' });
  }

  // Size handling
  let width = parseInt(size, 10);
  if (!Number.isFinite(width) || width <= 0) {
    width = 300;
  }
  width = Math.max(150, Math.min(width, 800));

  // Basic color validation
  const safeColorDark =
    typeof colorDark === 'string' && colorDark.startsWith('#')
      ? colorDark
      : '#000000';
  const safeColorLight =
    typeof colorLight === 'string' && colorLight.startsWith('#')
      ? colorLight
      : '#ffffff';

  try {
    const hasProtocol = /^https?:\/\//i.test(url);
    const normalizedUrl = hasProtocol ? url.trim() : `http://${url.trim()}`;
    // URL validation
    new URL(normalizedUrl);

    const dataUrl = await QRCode.toDataURL(normalizedUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width,
      color: {
        dark: safeColorDark,
        light: safeColorLight
      }
    });

    return res.json({ dataUrl, normalizedUrl, width });
  } catch (e) {
    console.error('Invalid URL or QR generation error:', e);
    return res
      .status(400)
      .json({ error: 'URL格式不正确，请检查后重试 / Invalid URL, please check and try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
