// High-resolution Canvas Compositor & Exporter for T-Shirt Mockups

/**
 * Loads an image from a URL or object URL as an HTMLImageElement
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Converts a hex color to {r, g, b}
 */
function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Calculates luminance (0 to 1) of a color
 */
export function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Render complete mockup onto an offscreen canvas at full 896x1200 resolution
 */
export async function renderMockupCanvas({
  modelConfig,
  shirtColorHex,
  skinToneFilter = 'none',
  graphicImgElement,
  graphicState, // { x, y, scale, rotation, flipH, flipV, blendMode, opacity }
  stageDimensions, // { width, height } of the DOM stage for coordinate mapping
}) {
  const canvasWidth = 896;
  const canvasHeight = 1200;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  // 1. Studio Background: Draw static studio background untouched (no skin filter)
  const bgImg = await loadImage(modelConfig.bgImage || modelConfig.baseImage);
  ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);

  // 2. Human Model Cutout: Apply skin tone / complexion filter ONLY to the person figure
  const personImg = await loadImage(modelConfig.personImage || modelConfig.baseImage);
  ctx.save();
  if (skinToneFilter && skinToneFilter !== 'none') {
    ctx.filter = skinToneFilter;
  }
  ctx.drawImage(personImg, 0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // 2. Garment layer: Draw original white shirt cutout first so skin filter doesn't bleed into shirt
  const [shirtImg, maskImg, shadowsImg] = await Promise.all([
    loadImage(modelConfig.shirtImage),
    loadImage(modelConfig.maskImage),
    loadImage(modelConfig.shadowsImage)
  ]);
  ctx.drawImage(shirtImg, 0, 0, canvasWidth, canvasHeight);

  // 3. Garment recoloring if not white
  const isWhite = shirtColorHex.toUpperCase() === '#FFFFFF';
  if (!isWhite) {
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = canvasWidth;
    colorCanvas.height = canvasHeight;
    const colorCtx = colorCanvas.getContext('2d');

    // Fill with selected color
    colorCtx.fillStyle = shirtColorHex;
    colorCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Mask with shirt silhouette (source-in retains only shirt shape)
    colorCtx.globalCompositeOperation = 'destination-in';
    colorCtx.drawImage(maskImg, 0, 0, canvasWidth, canvasHeight);

    // Draw colored shirt onto base image with multiply blending
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(colorCanvas, 0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // If dark garment, add subtle sheen/highlights back (subtle so black stays deep and rich)
    const lum = getLuminance(shirtColorHex);
    if (lum < 0.35) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = (1.0 - lum) * 0.10;
      ctx.drawImage(shadowsImg, 0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    }
  }

  // 4. Render User Graphic if present
  if (graphicImgElement && graphicImgElement.src) {
    ctx.save();

    let canvasGraphicX, canvasGraphicY, canvasGraphicW, canvasGraphicH;

    if (graphicState.canvasCenterX !== undefined) {
      canvasGraphicX = graphicState.canvasCenterX;
      canvasGraphicY = graphicState.canvasCenterY;
      canvasGraphicW = graphicState.canvasWidth;
      canvasGraphicH = graphicState.canvasHeight;
    } else {
      // Coordinate mapping fallback
      const scaleX = canvasWidth / stageDimensions.width;
      const scaleY = canvasHeight / stageDimensions.height;
      canvasGraphicX = graphicState.x * scaleX;
      canvasGraphicY = graphicState.y * scaleY;
      canvasGraphicW = graphicState.width * scaleX * graphicState.scale;
      canvasGraphicH = graphicState.height * scaleY * graphicState.scale;
    }

    // Guarantee that graphic preserves its natural aspect ratio with 0% distortion
    const naturalW = graphicImgElement.naturalWidth || graphicImgElement.width;
    const naturalH = graphicImgElement.naturalHeight || graphicImgElement.height;
    if (naturalW && naturalH && canvasGraphicW > 0 && canvasGraphicH > 0) {
      const naturalAspect = naturalW / naturalH;
      const targetAspect = canvasGraphicW / canvasGraphicH;
      if (Math.abs(targetAspect - naturalAspect) > 0.005) {
        canvasGraphicH = canvasGraphicW / naturalAspect;
      }
    }

    // Translate to center of graphic
    ctx.translate(canvasGraphicX, canvasGraphicY);
    ctx.rotate((graphicState.rotation * Math.PI) / 180);
    ctx.scale(graphicState.flipH ? -1 : 1, graphicState.flipV ? -1 : 1);

    // Blend mode and opacity
    ctx.globalAlpha = graphicState.opacity;
    const lum = getLuminance(shirtColorHex);
    // On dark garments (lum < 0.25), realistic apparel printing (DTG / DTF / screenprint) requires
    // an opaque white underbase, matching the DOM preview ('mix-blend-mode: normal' / 'source-over').
    // Multiplying artwork into dark fabric results in artwork * 0 = 0 (blacking out the graphic).
    const effectiveBlendMode = (graphicState.blendMode === 'multiply' && lum >= 0.25) ? 'multiply' : 'source-over';
    ctx.globalCompositeOperation = effectiveBlendMode;

    // Draw centered
    ctx.drawImage(
      graphicImgElement,
      -canvasGraphicW / 2,
      -canvasGraphicH / 2,
      canvasGraphicW,
      canvasGraphicH
    );

    ctx.restore();

    // 5. Subtle fabric shadow draping (gentle creases over the garment and artwork for photorealism)
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = effectiveBlendMode === 'multiply' ? 0.22 : 0.15;
    ctx.drawImage(shadowsImg, 0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  return canvas;
}

/**
 * Triggers a download of the canvas as PNG
 */
export async function downloadMockupPNG(params, filename = 'tshirt-mockup.png') {
  const canvas = await renderMockupCanvas(params);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a Tech Pack JSON file
 */
export function downloadTechPackJSON(specData, filename = 'tshirt-techpack.json') {
  const jsonStr = JSON.stringify(specData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
