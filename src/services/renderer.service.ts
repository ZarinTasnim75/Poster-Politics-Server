import { createCanvas, loadImage, GlobalFonts, CanvasRenderingContext2D } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';
import { AILayoutConfig } from './gemini.service';

const FONT_NAME = 'Noto Sans Bengali';
const fontPath = path.join(process.cwd(), 'src/assets/fonts/NotoSansBengali-Bold.ttf');

try {
  GlobalFonts.registerFromPath(fontPath, FONT_NAME);
} catch (e) {
  console.warn('Font registration note:', fontPath);
}

export interface RenderOptions {
  formData: {
    name: string;
    designation: string;
    party: string;
    location: string;
    headline: string;
    occasion: string;
    subline?: string;
  };
  photoUrls: string[];
  templateBgUrl?: string;
  aiConfig: AILayoutConfig;
}

function drawStrokedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fillColor: string,
  strokeColor: string = '#000000',
  strokeWidth: number = 8,
  maxWidth?: number
) {
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  if (maxWidth) {
    ctx.strokeText(text, x, y, maxWidth);
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y, maxWidth);
  } else {
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

export async function renderPosterToBuffer(options: RenderOptions): Promise<Buffer> {
  const WIDTH = 1200;
  const HEIGHT = 1600;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const { aiConfig, formData } = options;

  const c1 = aiConfig?.primaryAccentColor || '#006A4E';
  const c2 = aiConfig?.secondaryAccentColor || '#F42A41';
  const c3 = aiConfig?.tertiaryAccentColor || '#1A1A1A';

  if (aiConfig?.gridStyle === 'three-band') {
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, WIDTH, 500);

    ctx.fillStyle = c2;
    ctx.fillRect(0, 500, WIDTH, 600);

    ctx.fillStyle = c3;
    ctx.fillRect(0, 1100, WIDTH, 500);
  } else if (aiConfig?.gridStyle === 'two-band') {
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, WIDTH, 950);

    ctx.fillStyle = c2;
    ctx.fillRect(0, 950, WIDTH, 650);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c3);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  if (aiConfig?.motifStyle === 'flag') {
    ctx.save();
    ctx.fillStyle = 'rgba(224, 43, 43, 0.85)';
    ctx.beginPath();
    ctx.arc(WIDTH / 2, 320, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (aiConfig?.motifStyle === 'sunburst') {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 320);
      ctx.arc(WIDTH / 2, 320, 1000, angle, angle + 0.12);
      ctx.fill();
    }
    ctx.restore();
  }

  const roseImgPath = path.join(process.cwd(), 'src', 'assets', 'symbols', 'rose.png');
  const roseStartY = 160;
  const roseEndY = HEIGHT - 280;
  const roseSpacing = 150;
  const roseSize = 85;
  const roseX = WIDTH - 110;

  if (fs.existsSync(roseImgPath)) {
    try {
      const roseImg = await loadImage(roseImgPath);
      for (let y = roseStartY; y <= roseEndY; y += roseSpacing) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.drawImage(roseImg, roseX, y, roseSize, roseSize);
        ctx.restore();
      }
    } catch (err) {
      console.error('Failed to load rose image:', err);
    }
  } else {
    for (let y = roseStartY; y <= roseEndY; y += roseSpacing) {
      const cx = roseX + roseSize / 2;
      const cy = y + roseSize / 2;

      ctx.save();
      ctx.fillStyle = '#E02B2B';
      for (let a = 0; a < 6; a++) {
        const angle = (a * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * 16, cy + Math.sin(angle) * 16, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#900C3F';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const partyRaw = (formData.party || '').trim().toLowerCase();
  const symbolsDir = path.join(process.cwd(), 'src', 'assets', 'symbols');

  const isPaddy =
    partyRaw.includes('ছাত্রদল') ||
    partyRaw.includes('জাতীয়তাবাদী') ||
    partyRaw.includes('বিএনপি') ||
    partyRaw.includes('bnp');

  const isPlough =
    partyRaw.includes('জাতীয় পার্টি') ||
    partyRaw.includes('জাপা') ||
    partyRaw.includes('লাঙ্গল') ||
    partyRaw.includes('jatiya party') ||
    partyRaw.includes('jp');

  const isScale =
    partyRaw.includes('শিবির') ||
    partyRaw.includes('জামায়াত') ||
    partyRaw.includes('জামায়াত') ||
    partyRaw.includes('দাঁড়িপাল্লা') ||
    partyRaw.includes('jamaat') ||
    partyRaw.includes('shibir');

  try {
    if (isPaddy) {
      const paddyImgPath = path.join(symbolsDir, 'paddy.png');
      if (fs.existsSync(paddyImgPath)) {
        const paddyImg = await loadImage(paddyImgPath);
        ctx.drawImage(paddyImg, 40, 680, 160, 280);
      } else {
        console.warn(`[Symbol Warning] paddy.png missing at ${paddyImgPath}`);
      }
    } else if (isPlough) {
      const ploughImgPath = path.join(symbolsDir, 'plough.png');
      if (fs.existsSync(ploughImgPath)) {
        const ploughImg = await loadImage(ploughImgPath);
        ctx.drawImage(ploughImg, 40, 680, 180, 240);
      } else {
        console.warn(`[Symbol Warning] plough.png missing at ${ploughImgPath}`);
      }
    } else if (isScale) {
      const scaleImgPath = path.join(symbolsDir, 'scale.png');
      if (fs.existsSync(scaleImgPath)) {
        const scaleImg = await loadImage(scaleImgPath);
        ctx.drawImage(scaleImg, 40, 680, 180, 240);
      } else {
        console.warn(`[Symbol Warning] scale.png missing at ${scaleImgPath}`);
      }
    } else {
      const lilyPath = path.join(symbolsDir, 'waterlily.png');
      const dovePath = path.join(symbolsDir, 'dove.png');

      if (fs.existsSync(lilyPath)) {
        const lilyImg = await loadImage(lilyPath);
        ctx.drawImage(lilyImg, 40, 720, 150, 150);
      }
      if (fs.existsSync(dovePath)) {
        const doveImg = await loadImage(dovePath);
        ctx.drawImage(doveImg, 40, 560, 140, 140);
      }
    }
  } catch (err) {
    console.error('Failed to load party symbol image:', err);
  }

  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.roundRect(300, 45, 600, 80, [40]);
  ctx.fill();

  ctx.fillStyle = c1;
  ctx.beginPath();
  ctx.roundRect(306, 51, 588, 68, [34]);
  ctx.fill();

  ctx.font = `bold 32px "${FONT_NAME}"`;
  ctx.textAlign = 'center';
  const topBadgeText = aiConfig?.badgeText || formData.occasion || 'শুভেচ্ছা বার্তা';
  drawStrokedText(ctx, topBadgeText, WIDTH / 2, 96, '#FFD700', '#000000', 4, 560);

  const photos = options.photoUrls || [];
  if (photos.length > 0) {
    const photoCount = Math.min(photos.length, 3);
    const radius = photoCount === 1 ? 130 : 105;
    const centerY = 300;
    const spacing = radius * 2 + 40;
    const startX = WIDTH / 2 - ((photoCount - 1) * spacing) / 2;

    for (let i = 0; i < photoCount; i++) {
      try {
        const img = await loadImage(photos[i]);
        const cx = startX + i * spacing;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, centerY, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, cx - radius, centerY - radius, radius * 2, radius * 2);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(cx, centerY, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 8;
        ctx.stroke();
      } catch (err) {
        console.error('Failed to render leader photo:', err);
      }
    }
  }

  const headlineY = 660;
  ctx.textAlign = 'center';

  ctx.font = `bold 64px "${FONT_NAME}"`;
  const mainHeadline = aiConfig?.formattedHeadline || formData.headline || 'শুভেচ্ছা ও অভিনন্দন';

  drawStrokedText(
    ctx,
    mainHeadline,
    WIDTH / 2 + 20,
    headlineY,
    '#FFD700',
    '#8B0000',
    12,
    880
  );

  const sublineText =
    aiConfig?.suggestedSubline ||
    formData.subline ||
    'একত্রে দেশ গড়ার অঙ্গীকার';

  if (sublineText) {
    ctx.font = `bold 32px "${FONT_NAME}"`;
    drawStrokedText(
      ctx,
      `"${sublineText.replace(/"/g, '')}"`,
      WIDTH / 2 + 20,
      headlineY + 80,
      '#FFFFFF',
      '#000000',
      4,
      820
    );
  }

  const footerY = HEIGHT - 250;
  const footerHeight = 190;

  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.roundRect(60, footerY, 1080, footerHeight, [24]);
  ctx.fill();

  ctx.fillStyle = '#004D25';
  ctx.beginPath();
  ctx.roundRect(66, footerY + 6, 1068, footerHeight - 12, [20]);
  ctx.fill();

  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.roundRect(100, footerY + 22, 130, 38, [8]);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.font = `bold 22px "${FONT_NAME}"`;
  ctx.textAlign = 'center';
  ctx.fillText('প্রচারে:', 165, footerY + 48);

  ctx.textAlign = 'left';
  ctx.font = `bold 44px "${FONT_NAME}"`;
  drawStrokedText(ctx, formData.name, 250, footerY + 56, '#FFD700', '#000000', 6);

  ctx.font = `bold 26px "${FONT_NAME}"`;
  const infoLine = `${formData.designation} | ${formData.party}`;
  drawStrokedText(ctx, infoLine, 100, footerY + 112, '#FFFFFF', '#000000', 5);
  drawStrokedText(ctx, formData.location, 100, footerY + 154, '#D8C9A8', '#000000', 4);

  return await canvas.toBuffer('image/png');
}