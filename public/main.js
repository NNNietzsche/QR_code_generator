// main.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('qr-form');
  const urlInput = document.getElementById('url-input');
  const colorDarkInput = document.getElementById('color-dark');
  const colorLightInput = document.getElementById('color-light');
  const sizeInput = document.getElementById('size-input');
  const generateBtn = document.getElementById('generate-btn');
  const messageEl = document.getElementById('message');
  const resultEl = document.getElementById('result');
  const qrImage = document.getElementById('qr-image');
  const finalUrlEl = document.getElementById('final-url');
  const downloadLink = document.getElementById('download-link');

  const logoInput = document.getElementById('logo-input');
  const applyLogoBtn = document.getElementById('apply-logo-btn');
  const canvas = document.getElementById('qr-canvas');
  const ctx = canvas.getContext('2d');

  const langZhBtn = document.getElementById('lang-zh');
  const langEnBtn = document.getElementById('lang-en');

  // i18n dictionary
  const translations = {
    zh: {
      title: 'URL 转二维码',
      subtitle: '输入一个链接，一键生成二维码，可自定义颜色和 LOGO',
      urlLabel: '请输入 URL：',
      urlPlaceholder: '例如：https://example.com 或 baidu.com',
      colorDarkLabel: '二维码颜色：',
      colorLightLabel: '背景颜色：',
      sizeLabel: '尺寸（px，150~600）：',
      generateBtn: '生成二维码',
      resultTitle: '生成结果',
      resultUrlPrefix: '对应链接：',
      downloadText: '下载二维码图片',
      logoLabel: '可选：上传 LOGO（会叠加在二维码中间）',
      applyLogoBtn: '应用 LOGO',
      footer: '简单示例 · 可自行二次开发 / 部署',
      msgEnterUrl: '请输入要生成二维码的 URL',
      msgSuccessNoLogo: '生成成功！如需 LOGO，可下方上传并应用。',
      msgNeedQrBeforeLogo: '请先生成一个二维码再上传 LOGO',
      msgNeedLogoFile: '请先选择一个 LOGO 图片文件',
      msgApplyLogoProcessing: '正在应用 LOGO...',
      msgApplyLogoSuccess: 'LOGO 已应用成功，如有需要可以重新生成或更换 LOGO。',
      msgReadLogoError: '读取 LOGO 文件失败，请重试'
    },
    en: {
      title: 'URL to QR Code',
      subtitle: 'Enter a link and generate a QR code with custom color and logo.',
      urlLabel: 'Enter URL:',
      urlPlaceholder: 'e.g. https://example.com or google.com',
      colorDarkLabel: 'QR color:',
      colorLightLabel: 'Background color:',
      sizeLabel: 'Size (px, 150–600):',
      generateBtn: 'Generate QR Code',
      resultTitle: 'Result',
      resultUrlPrefix: 'URL: ',
      downloadText: 'Download QR image',
      logoLabel: 'Optional: upload LOGO (placed at the center)',
      applyLogoBtn: 'Apply LOGO',
      footer: 'Demo project · Feel free to extend / deploy',
      msgEnterUrl: 'Please enter a URL to generate QR.',
      msgSuccessNoLogo: 'Generated successfully! Upload a LOGO below if needed.',
      msgNeedQrBeforeLogo: 'Generate a QR code first, then apply a LOGO.',
      msgNeedLogoFile: 'Please select a LOGO image file.',
      msgApplyLogoProcessing: 'Applying LOGO...',
      msgApplyLogoSuccess: 'LOGO applied successfully. You can regenerate or change it anytime.',
      msgReadLogoError: 'Failed to read LOGO file, please try again.'
    }
  };

  let currentLang = 'zh';

  function t(key) {
    const langPack = translations[currentLang] || translations.zh;
    return langPack[key] || translations.zh[key] || key;
  }

  function applyTranslations() {
    // Text nodes with data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;

      if (el.tagName.toLowerCase() === 'input') {
        // For <input> if needed (not used currently)
        return;
      }

      el.textContent = t(key);
    });

    // Placeholder for URL input
    urlInput.placeholder = t('urlPlaceholder');

    // Button text & others if not handled above
    generateBtn.textContent = t('generateBtn');
    downloadLink.textContent = t('downloadText');
    applyLogoBtn.textContent = t('applyLogoBtn');
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    applyTranslations();
    langZhBtn.classList.toggle('active', lang === 'zh');
    langEnBtn.classList.toggle('active', lang === 'en');
  }

  // Language switch handlers
  langZhBtn.addEventListener('click', () => setLanguage('zh'));
  langEnBtn.addEventListener('click', () => setLanguage('en'));

  function showMessage(msg, type = 'error') {
    messageEl.textContent = msg || '';
    messageEl.classList.remove('success');
    if (type === 'success') {
      messageEl.classList.add('success');
    }
  }

  // Initial language setup
  setLanguage('zh');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = urlInput.value.trim();
    if (!url) {
      showMessage(t('msgEnterUrl'));
      resultEl.classList.add('hidden');
      return;
    }

    const colorDark = colorDarkInput.value;
    const colorLight = colorLightInput.value;
    const size = sizeInput.value;

    generateBtn.disabled = true;
    generateBtn.textContent = currentLang === 'zh' ? '生成中…' : 'Generating…';
    showMessage('');

    try {
      const resp = await fetch('/api/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, colorDark, colorLight, size })
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Error');
      }

      qrImage.src = data.dataUrl;
      finalUrlEl.textContent = t('resultUrlPrefix') + (data.normalizedUrl || url);
      downloadLink.href = data.dataUrl;

      resultEl.classList.remove('hidden');
      showMessage(t('msgSuccessNoLogo'), 'success');
    } catch (err) {
      console.error(err);
      showMessage(err.message || 'Error');
      resultEl.classList.add('hidden');
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = t('generateBtn');
    }
  });

  // Apply logo onto QR
  applyLogoBtn.addEventListener('click', () => {
    if (!qrImage.src) {
      showMessage(t('msgNeedQrBeforeLogo'));
      return;
    }
    const file = logoInput.files && logoInput.files[0];
    if (!file) {
      showMessage(t('msgNeedLogoFile'));
      return;
    }

    showMessage(t('msgApplyLogoProcessing'), 'success');

    const reader = new FileReader();
    reader.onload = () => {
      const logoImg = new Image();
      logoImg.onload = () => {
        const qrImg = new Image();
        qrImg.onload = () => {
          canvas.width = qrImg.width;
          canvas.height = qrImg.height;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(qrImg, 0, 0, canvas.width, canvas.height);

          // Logo size: 25% of QR width
          const logoScale = 0.25;
          const logoSize = canvas.width * logoScale;
          const logoX = (canvas.width - logoSize) / 2;
          const logoY = (canvas.height - logoSize) / 2;

          // White rounded background for logo to improve readability
          const radius = logoSize * 0.2;
          ctx.save();
          ctx.fillStyle = '#ffffff';
          roundedRect(ctx, logoX, logoY, logoSize, logoSize, radius);
          ctx.fill();
          ctx.restore();

          // Draw logo
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

          const finalDataUrl = canvas.toDataURL('image/png');
          qrImage.src = finalDataUrl;
          downloadLink.href = finalDataUrl;

          showMessage(t('msgApplyLogoSuccess'), 'success');
        };
        qrImg.src = qrImage.src;
      };
      logoImg.src = reader.result;
    };

    reader.onerror = () => {
      showMessage(t('msgReadLogoError'));
    };

    reader.readAsDataURL(file);
  });

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - r,
      y + height
    );
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
});
