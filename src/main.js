// Atelier T-Shirt Studio — Main Application Controller

import { MODELS_CONFIG, COLOR_SWATCHES, SAMPLE_GRAPHICS, ETHNICITY_OPTIONS, SKIN_TONE_PRESETS } from './model-config.js';
import { getLuminance, downloadMockupPNG, downloadTechPackJSON } from './canvas-exporter.js';

// --- State ---
const state = {
  gender: 'male',
  ethnicity: 'caucasian', // 'caucasian', 'black', 'asian'
  skinTone: 'natural',
  skinDepth: 0, // -40 to +40
  skinWarmth: 0, // -30 to +30
  style: 'crew',
  shirtColor: '#FFFFFF',
  fabricFinish: 'cotton', // 'cotton' or 'vintage'
  zoom: 1.0,
  showGuide: false, // Print zone is NOT shown by default
  
  // Custom print area overrides (percentage)
  printArea: null,

  // Artwork state
  graphic: {
    src: null,
    filename: null,
    type: null,
    dimensions: { width: 0, height: 0 },
    sizeText: '',
    isAnimated: false,
  },

  // Transform state relative to model chest center
  transform: {
    scale: 1.0,
    rotation: 0,
    offsetX: 0, // px from model chest center
    offsetY: 0,
    flipH: false,
    flipV: false,
    blendMode: 'multiply', // 'multiply' or 'normal'
    opacity: 1.0,
  }
};

// --- DOM Element References ---
const elements = {
  // Header
  headerModelLabel: document.getElementById('headerModelLabel'),
  headerStyleLabel: document.getElementById('headerStyleLabel'),
  headerColorLabel: document.getElementById('headerColorLabel'),
  headerColorDot: document.getElementById('headerColorDot'),
  btnToggleGuide: document.getElementById('btnToggleGuide'),
  guideBtnText: document.getElementById('guideBtnText'),
  btnExportMockup: document.getElementById('btnExportMockup'),
  btnExportSpec: document.getElementById('btnExportSpec'),

  // Stage Viewport & Layers
  stageViewport: document.getElementById('stageViewport'),
  stageContainer: document.getElementById('stageContainer'),
  modelBgImg: document.getElementById('modelBgImg'),
  modelPersonImg: document.getElementById('modelPersonImg'),
  modelBaseImg: document.getElementById('modelPersonImg') || document.getElementById('modelBaseImg'),
  shirtBaseImg: document.getElementById('shirtBaseImg'),
  garmentColorCanvas: document.getElementById('garmentColorCanvas'),
  garmentHighlightsImg: document.getElementById('garmentHighlightsImg'),
  garmentShadowsImg: document.getElementById('garmentShadowsImg'),
  printAreaContainer: document.getElementById('printAreaContainer'),
  printZoneGuide: document.getElementById('printZoneGuide'),
  guideBadge: document.getElementById('guideBadge'),
  stageLoadingOverlay: document.getElementById('stageLoadingOverlay'),

  // Floating Stage Controls
  btnZoomIn: document.getElementById('btnZoomIn'),
  btnZoomOut: document.getElementById('btnZoomOut'),
  btnZoomReset: document.getElementById('btnZoomReset'),
  zoomLevelText: document.getElementById('zoomLevelText'),
  stageArtworkTools: document.getElementById('stageArtworkTools'),
  btnToolCenterX: document.getElementById('btnToolCenterX'),
  btnToolCenterY: document.getElementById('btnToolCenterY'),
  btnToolFitChest: document.getElementById('btnToolFitChest'),
  btnToolRemove: document.getElementById('btnToolRemove'),

  // Graphic Element & Handles
  graphicTransformWrapper: document.getElementById('graphicTransformWrapper'),
  userGraphicImg: document.getElementById('userGraphicImg'),
  graphicSelectionBox: document.getElementById('graphicSelectionBox'),
  handleRotate: document.getElementById('handleRotate'),

  // Sidebar: Model, Race & Skin Complexion
  genderSelector: document.getElementById('genderSelector'),
  ethnicitySelector: document.getElementById('ethnicitySelector'),
  skinTonesGrid: document.getElementById('skinTonesGrid'),
  activeSkinToneLabel: document.getElementById('activeSkinToneLabel'),
  sliderSkinDepth: document.getElementById('sliderSkinDepth'),
  skinDepthVal: document.getElementById('skinDepthVal'),
  sliderSkinWarmth: document.getElementById('sliderSkinWarmth'),
  skinWarmthVal: document.getElementById('skinWarmthVal'),

  // Sidebar: Style
  styleSelector: document.getElementById('styleSelector'),

  // Sidebar: Flexible Color
  colorCategoryTabs: document.getElementById('colorCategoryTabs'),
  colorSwatchesGrid: document.getElementById('colorSwatchesGrid'),
  sliderHue: document.getElementById('sliderHue'),
  hueValText: document.getElementById('hueValText'),
  sliderLightness: document.getElementById('sliderLightness'),
  lightnessValText: document.getElementById('lightnessValText'),
  nativeColorInput: document.getElementById('nativeColorInput'),
  colorPreviewBox: document.getElementById('colorPreviewBox'),
  hexInput: document.getElementById('hexInput'),
  btnEyedropper: document.getElementById('btnEyedropper'),
  recentSwatchesList: document.getElementById('recentSwatchesList'),
  finishPills: document.getElementById('finishPills'),

  // Sidebar: Artwork & Upload
  dropzone: document.getElementById('dropzone'),
  fileInput: document.getElementById('fileInput'),
  graphicMetaCard: document.getElementById('graphicMetaCard'),
  metaThumbImg: document.getElementById('metaThumbImg'),
  metaAnimBadge: document.getElementById('metaAnimBadge'),
  metaFileName: document.getElementById('metaFileName'),
  metaDimensions: document.getElementById('metaDimensions'),
  metaFileSize: document.getElementById('metaFileSize'),
  metaFileType: document.getElementById('metaFileType'),
  btnRemoveArtwork: document.getElementById('btnRemoveArtwork'),
  sampleArtGrid: document.getElementById('sampleArtGrid'),

  // Sidebar: Placement & Print
  presetsRow: document.querySelector('.presets-row'),
  sliderScale: document.getElementById('sliderScale'),
  scaleValueText: document.getElementById('scaleValueText'),
  sliderRotate: document.getElementById('sliderRotate'),
  rotateValueText: document.getElementById('rotateValueText'),
  sliderOffsetX: document.getElementById('sliderOffsetX'),
  offsetXValueText: document.getElementById('offsetXValueText'),
  sliderOffsetY: document.getElementById('sliderOffsetY'),
  offsetYValueText: document.getElementById('offsetYValueText'),
  sliderOpacity: document.getElementById('sliderOpacity'),
  opacityValueText: document.getElementById('opacityValueText'),
  btnFlipH: document.getElementById('btnFlipH'),
  btnFlipV: document.getElementById('btnFlipV'),
  btnResetTransform: document.getElementById('btnResetTransform'),
  blendSelector: document.getElementById('blendSelector'),

  // Summary & Export Footer
  specSummaryGarment: document.getElementById('specSummaryGarment'),
  specSummarySkinTone: document.getElementById('specSummarySkinTone'),
  specSummaryStyle: document.getElementById('specSummaryStyle'),
  specSummaryColor: document.getElementById('specSummaryColor'),
  specSummaryArt: document.getElementById('specSummaryArt'),
  specSummaryZone: document.getElementById('specSummaryZone'),
  btnBottomExport: document.getElementById('btnBottomExport'),
  btnBottomSpec: document.getElementById('btnBottomSpec'),

  // Advanced Settings Modal
  advancedModal: document.getElementById('advancedModal'),
  btnOpenAdvancedModal: document.getElementById('btnOpenAdvancedModal'),
  btnCloseAdvancedModal: document.getElementById('btnCloseAdvancedModal'),
  btnModalDone: document.getElementById('btnModalDone'),

  // Toast
  toastNotification: document.getElementById('toastNotification'),
  toastMessage: document.getElementById('toastMessage'),
};

// Mask Image cache for instantaneous canvas rendering
const maskImageCache = new Map();

function getLoadedMask(src) {
  if (maskImageCache.has(src)) {
    return Promise.resolve(maskImageCache.get(src));
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      maskImageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Category filter state & recent colors history
let activeColorCategory = 'all';
let recentColors = ['#FFFFFF', '#18181B', '#475569', '#1E293B', '#15803D', '#1D4ED8'];

function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function addRecentColor(hex) {
  if (!hex) return;
  hex = hex.toUpperCase();
  recentColors = [hex, ...recentColors.filter(c => c !== hex)].slice(0, 8);
  renderRecentColors();
}

function renderRecentColors() {
  if (!elements.recentSwatchesList) return;
  elements.recentSwatchesList.innerHTML = '';
  recentColors.forEach(hex => {
    const swatch = document.createElement('div');
    swatch.className = 'recent-swatch';
    swatch.style.backgroundColor = hex;
    swatch.title = hex;
    swatch.addEventListener('click', () => {
      setShirtColor(hex, `Custom ${hex}`);
    });
    elements.recentSwatchesList.appendChild(swatch);
  });
}

// --- Initialization ---
function init() {
  renderSkinToneSwatches();
  renderColorSwatches();
  renderRecentColors();
  attachEventListeners();
  setupDirectManipulation();
  setupPrintZoneResizing();
  setupCollapsiblePanels();
  setupAdvancedModal();
  
  // Set default model figure (clean state: no sample artwork pre-loaded)
  updateModelAndStyle();
  clearArtwork();
}

// --- Render Helpers ---

function renderSkinToneSwatches() {
  elements.skinTonesGrid.innerHTML = '';
  SKIN_TONE_PRESETS.forEach(preset => {
    const btn = document.createElement('button');
    btn.className = `skin-swatch-btn ${preset.id === state.skinTone ? 'active' : ''}`;
    btn.style.backgroundColor = preset.swatchHex;
    btn.title = preset.name;
    btn.dataset.id = preset.id;
    btn.addEventListener('click', () => {
      setSkinTonePreset(preset.id);
    });
    elements.skinTonesGrid.appendChild(btn);
  });
}

function renderColorSwatches(category = activeColorCategory) {
  if (!elements.colorSwatchesGrid) return;
  elements.colorSwatchesGrid.innerHTML = '';
  
  const filtered = category === 'all'
    ? COLOR_SWATCHES
    : COLOR_SWATCHES.filter(s => s.category === category);

  filtered.forEach(swatch => {
    const btn = document.createElement('button');
    btn.className = `swatch-btn ${swatch.hex.toUpperCase() === state.shirtColor.toUpperCase() ? 'active' : ''}`;
    btn.style.backgroundColor = swatch.hex;
    btn.title = swatch.name;
    btn.dataset.hex = swatch.hex;
    btn.dataset.name = swatch.name;
    btn.addEventListener('click', () => {
      setShirtColor(swatch.hex, swatch.name);
    });
    elements.colorSwatchesGrid.appendChild(btn);
  });
}

function renderSampleArtworks() {
  elements.sampleArtGrid.innerHTML = '';
  SAMPLE_GRAPHICS.forEach((sample, idx) => {
    const card = document.createElement('button');
    card.className = `sample-card ${idx === 0 ? 'active' : ''}`;
    card.dataset.index = idx;
    card.innerHTML = `
      <span class="sample-tag ${sample.isAnimated ? 'anim' : ''}">${sample.type}</span>
      <div class="sample-card-thumb">
        <img src="${sample.url}" alt="${sample.name}" />
      </div>
      <span class="sample-card-name">${sample.name}</span>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.sample-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      loadSampleArtwork(sample);
    });
    elements.sampleArtGrid.appendChild(card);
  });
}

// --- Model, Ethnicity & Skin Tone ---

function getCurrentModelConfig() {
  const genderData = MODELS_CONFIG[state.gender];
  const ethData = genderData.ethnicities[state.ethnicity] || genderData.ethnicities.caucasian;
  return ethData.styles[state.style] || ethData.styles.crew;
}

function updateModelAndStyle() {
  const modelConfig = getCurrentModelConfig();
  
  // Base layers: neutral studio background is untouched, person receives complexion filters
  if (elements.modelBgImg) {
    elements.modelBgImg.src = modelConfig.bgImage || modelConfig.baseImage;
  }
  if (elements.modelPersonImg) {
    elements.modelPersonImg.src = modelConfig.personImage || modelConfig.baseImage;
  } else if (elements.modelBaseImg) {
    elements.modelBaseImg.src = modelConfig.baseImage;
  }
  elements.shirtBaseImg.src = modelConfig.shirtImage;
  elements.garmentHighlightsImg.src = modelConfig.shadowsImage;
  elements.garmentShadowsImg.src = modelConfig.shadowsImage;

  // Initialize or reset print area calibration to model chest
  state.printArea = { ...modelConfig.printArea };
  applyPrintAreaCoordinates();

  // Update headers and summary
  const genderLabel = MODELS_CONFIG[state.gender].label;
  const ethData = MODELS_CONFIG[state.gender].ethnicities[state.ethnicity];
  const ethLabel = ethData ? ethData.label.split(' / ')[0] : 'Fair';
  const styleLabel = modelConfig.label;

  elements.headerModelLabel.textContent = `${genderLabel.split(' ')[0]} • ${ethLabel}`;
  elements.headerStyleLabel.textContent = styleLabel;
  elements.specSummaryGarment.textContent = `${genderLabel} • ${ethData ? ethData.label : 'Fair / Caucasian'}`;
  elements.specSummaryStyle.textContent = styleLabel;

  applySkinToneFilter();
  applyGarmentColor();
  updateGraphicDOM();
}

function applyPrintAreaCoordinates() {
  if (!state.printArea) return;
  const { left, top, width, height, maxInches } = state.printArea;
  elements.stageContainer.style.setProperty('--print-left', `${left}%`);
  elements.stageContainer.style.setProperty('--print-top', `${top}%`);
  elements.stageContainer.style.setProperty('--print-width', `${width}%`);
  elements.stageContainer.style.setProperty('--print-height', `${height}%`);

  const inchesStr = maxInches || `${(width / 3).toFixed(1)}" × ${(height / 2.2).toFixed(1)}"`;
  elements.guideBadge.textContent = `Print Zone • ${inchesStr}`;
  elements.specSummaryZone.textContent = `Chest Center • ${inchesStr}`;
}

function setSkinTonePreset(presetId) {
  state.skinTone = presetId;
  const preset = SKIN_TONE_PRESETS.find(p => p.id === presetId) || SKIN_TONE_PRESETS[0];
  elements.activeSkinToneLabel.textContent = preset.name;
  elements.specSummarySkinTone.textContent = preset.name;

  document.querySelectorAll('.skin-swatch-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === presetId);
  });

  state.skinDepth = 0;
  state.skinWarmth = 0;
  elements.sliderSkinDepth.value = 0;
  elements.sliderSkinWarmth.value = 0;
  elements.skinDepthVal.textContent = 'Default';
  elements.skinWarmthVal.textContent = 'Neutral';

  applySkinToneFilter();
}

function calculateCurrentSkinFilter() {
  const preset = SKIN_TONE_PRESETS.find(p => p.id === state.skinTone) || SKIN_TONE_PRESETS[0];
  let filterStr = preset.filter === 'none' ? '' : preset.filter;

  if (state.skinDepth !== 0) {
    const b = 1.0 + (state.skinDepth / 100);
    const c = 1.0 + (state.skinDepth < 0 ? -state.skinDepth / 250 : state.skinDepth / 200);
    filterStr += ` brightness(${b.toFixed(2)}) contrast(${c.toFixed(2)})`;
  }

  if (state.skinWarmth > 0) {
    const s = (state.skinWarmth / 100) * 0.4;
    const h = -(state.skinWarmth * 0.5);
    filterStr += ` sepia(${s.toFixed(2)}) hue-rotate(${h.toFixed(1)}deg) saturate(1.15)`;
  } else if (state.skinWarmth < 0) {
    const coolHue = -state.skinWarmth * 0.4;
    filterStr += ` hue-rotate(${coolHue.toFixed(1)}deg) saturate(0.95)`;
  }

  return filterStr.trim() || 'none';
}

function applySkinToneFilter() {
  const filter = calculateCurrentSkinFilter();
  elements.stageContainer.style.setProperty('--model-skin-filter', filter);
}

// --- Rock-Solid Garment Color Compositor (Guarantees 0% bleed) ---

function setShirtColor(hex, name = '') {
  state.shirtColor = hex;
  elements.nativeColorInput.value = hex;
  elements.hexInput.value = hex.replace('#', '').toUpperCase();
  elements.colorPreviewBox.style.backgroundColor = hex;
  elements.headerColorDot.style.backgroundColor = hex;

  const foundSwatch = COLOR_SWATCHES.find(s => s.hex.toLowerCase() === hex.toLowerCase());
  const colorName = name || (foundSwatch ? foundSwatch.name : 'Custom');
  elements.headerColorLabel.textContent = colorName;
  elements.specSummaryColor.textContent = `${hex.toUpperCase()} (${colorName})`;

  document.querySelectorAll('.swatch-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.hex.toLowerCase() === hex.toLowerCase());
  });

  applyGarmentColor();
}

async function applyGarmentColor() {
  const canvas = elements.garmentColorCanvas;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const isWhite = state.shirtColor.toUpperCase() === '#FFFFFF';
  
  // Calculate sheen for dark garments
  const lum = getLuminance(state.shirtColor);
  let sheen = 0;
  if (lum < 0.35) {
    sheen = (1.0 - lum) * 0.45;
  }
  elements.stageContainer.style.setProperty('--sheen-opacity', sheen);

  // If colored, render chosen color STRICTLY inside shirt silhouette
  if (!isWhite) {
    const modelConfig = getCurrentModelConfig();
    try {
      const maskImg = await getLoadedMask(modelConfig.maskImage);
      // Draw mask with alpha channel
      ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
      // Retain only shirt shape and fill with chosen color
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = state.shirtColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    } catch (err) {
      console.error('Error drawing shirt color canvas:', err);
    }
  }

  // Adjust graphic ink blend mode on very dark shirts
  if (state.transform.blendMode === 'multiply') {
    if (lum < 0.25) {
      elements.userGraphicImg.style.mixBlendMode = 'normal';
    } else {
      elements.userGraphicImg.style.mixBlendMode = 'multiply';
    }
  }
}

// --- Artwork Handling ---

function handleFileUpload(file) {
  if (!file) return;

  const validTypes = ['image/gif', 'image/jpeg', 'image/jpg', 'image/webp', 'image/png', 'image/svg+xml'];
  if (!validTypes.includes(file.type) && !file.name.match(/\.(gif|jpg|jpeg|webp|png|svg)$/i)) {
    showToast('Please upload a GIF, JPEG, WebP, PNG, or SVG file.');
    return;
  }

  const isAnimated = file.type === 'image/gif';
  const reader = new FileReader();

  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const testImg = new Image();
    testImg.onload = () => {
      let sizeStr = '';
      if (file.size > 1024 * 1024) {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      } else {
        sizeStr = `${Math.round(file.size / 1024)} KB`;
      }

      let ext = file.name.split('.').pop().toUpperCase();
      if (!ext) ext = 'IMAGE';

      setGraphic({
        src: dataUrl,
        filename: file.name,
        type: ext,
        dimensions: { width: testImg.naturalWidth, height: testImg.naturalHeight },
        sizeText: sizeStr,
        isAnimated: isAnimated
      });

      showToast(`Uploaded ${file.name}`);
      document.querySelectorAll('.sample-card').forEach(c => c.classList.remove('active'));
    };
    testImg.src = dataUrl;
  };

  reader.readAsDataURL(file);
}

function loadSampleArtwork(sample) {
  const testImg = new Image();
  testImg.onload = () => {
    setGraphic({
      src: sample.url,
      filename: `${sample.name}.${sample.type.toLowerCase()}`,
      type: sample.type,
      dimensions: { width: testImg.naturalWidth, height: testImg.naturalHeight },
      sizeText: 'Studio Asset',
      isAnimated: sample.isAnimated
    });
  };
  testImg.src = sample.url;
}

function setGraphic({ src, filename, type, dimensions, sizeText, isAnimated }) {
  state.graphic = { src, filename, type, dimensions, sizeText, isAnimated };

  elements.userGraphicImg.src = src;

  const printZoneRect = elements.printAreaContainer.getBoundingClientRect();
  const maxW = printZoneRect.width > 0 ? printZoneRect.width * 0.75 : 180;
  const maxH = printZoneRect.height > 0 ? printZoneRect.height * 0.75 : 220;

  const aspect = dimensions.width / dimensions.height;
  let baseW, baseH;
  if (aspect >= 1) {
    baseW = Math.min(maxW, dimensions.width);
    baseH = baseW / aspect;
  } else {
    baseH = Math.min(maxH, dimensions.height);
    baseW = baseH * aspect;
  }

  elements.userGraphicImg.style.width = `${baseW}px`;
  elements.userGraphicImg.style.height = `${baseH}px`;

  // Reset transforms strictly centered on model chest
  state.transform.offsetX = 0;
  state.transform.offsetY = 0;
  state.transform.rotation = 0;
  state.transform.scale = 1.0;
  state.transform.flipH = false;
  state.transform.flipV = false;

  syncTransformSliders();
  updateGraphicDOM();

  elements.metaThumbImg.src = src;
  elements.metaFileName.textContent = filename;
  elements.metaDimensions.textContent = `${dimensions.width} × ${dimensions.height} px`;
  elements.metaFileSize.textContent = sizeText;
  elements.metaFileType.textContent = type;
  elements.metaAnimBadge.classList.toggle('hidden', !isAnimated);
  elements.graphicMetaCard.classList.remove('hidden');

  elements.specSummaryArt.textContent = `${filename} (${type})`;
  elements.stageArtworkTools.classList.remove('hidden');

  // Graphic corner resize handles are always visible around the graphic
  elements.graphicSelectionBox.classList.remove('hidden');
}

function clearArtwork() {
  state.graphic = {
    src: null,
    filename: null,
    type: null,
    dimensions: { width: 0, height: 0 },
    sizeText: '',
    isAnimated: false,
  };
  elements.userGraphicImg.src = '';
  elements.graphicMetaCard.classList.add('hidden');
  elements.stageArtworkTools.classList.add('hidden');
  elements.graphicSelectionBox.classList.add('hidden');
  elements.specSummaryArt.textContent = 'None';
  document.querySelectorAll('.sample-card').forEach(c => c.classList.remove('active'));
}

// --- Placement & Transform Controls (Aligned to Model Chest) ---

function updateGraphicDOM() {
  if (!state.graphic.src) {
    elements.graphicTransformWrapper.style.display = 'none';
    return;
  }
  elements.graphicTransformWrapper.style.display = 'flex';

  const { scale, rotation, offsetX, offsetY, flipH, flipV, blendMode, opacity } = state.transform;

  const scaleX = flipH ? -scale : scale;
  const scaleY = flipV ? -scale : scale;

  // Left: 50%, Top: 50% on wrapper centers on model chest; translate(-50%, -50%) centers graphic anchor
  elements.graphicTransformWrapper.style.transform = `
    translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))
    rotate(${rotation}deg)
    scale(${scaleX}, ${scaleY})
  `;

  elements.userGraphicImg.style.opacity = opacity;

  const lum = getLuminance(state.shirtColor);
  if (blendMode === 'multiply' && lum >= 0.25) {
    elements.userGraphicImg.style.mixBlendMode = 'multiply';
  } else {
    elements.userGraphicImg.style.mixBlendMode = 'normal';
  }
}

function syncTransformSliders() {
  elements.sliderScale.value = Math.round(state.transform.scale * 100);
  elements.scaleValueText.textContent = `${elements.sliderScale.value}%`;

  elements.sliderRotate.value = state.transform.rotation;
  elements.rotateValueText.textContent = `${state.transform.rotation}°`;

  elements.sliderOffsetX.value = state.transform.offsetX;
  elements.offsetXValueText.textContent = `${state.transform.offsetX} px`;

  elements.sliderOffsetY.value = state.transform.offsetY;
  elements.offsetYValueText.textContent = `${state.transform.offsetY} px`;

  elements.sliderOpacity.value = Math.round(state.transform.opacity * 100);
  elements.opacityValueText.textContent = `${elements.sliderOpacity.value}%`;

  elements.btnFlipH.classList.toggle('active', state.transform.flipH);
  elements.btnFlipV.classList.toggle('active', state.transform.flipV);
}

function applyPresetPlacement(preset) {
  switch (preset) {
    case 'center':
      state.transform.offsetX = 0;
      state.transform.offsetY = 0;
      state.transform.scale = 1.0;
      state.transform.rotation = 0;
      break;
    case 'pocket':
      state.transform.offsetX = 45;
      state.transform.offsetY = -35;
      state.transform.scale = 0.45;
      state.transform.rotation = 0;
      break;
    case 'large':
      state.transform.offsetX = 0;
      state.transform.offsetY = 15;
      state.transform.scale = 1.45;
      state.transform.rotation = 0;
      break;
    case 'minimal':
      state.transform.offsetX = 0;
      state.transform.offsetY = -55;
      state.transform.scale = 0.35;
      state.transform.rotation = 0;
      break;
  }
  syncTransformSliders();
  updateGraphicDOM();
}

// --- Direct Graphic Manipulation (Drag to move, Corner drag to resize, Handle to rotate) ---

function setupDirectManipulation() {
  let isDragging = false;
  let isRotating = false;
  let isResizing = false;

  let startX = 0;
  let startY = 0;
  let initialOffsetX = 0;
  let initialOffsetY = 0;
  let initialScale = 1.0;
  let initialRotation = 0;
  let centerX = 0;
  let centerY = 0;

  const wrapper = elements.graphicTransformWrapper;

  // Move graphic
  wrapper.addEventListener('pointerdown', (e) => {
    if (e.target.classList.contains('handle')) return;

    e.preventDefault();
    isDragging = true;
    wrapper.classList.add('dragging');
    wrapper.setPointerCapture(e.pointerId);

    startX = e.clientX;
    startY = e.clientY;
    initialOffsetX = state.transform.offsetX;
    initialOffsetY = state.transform.offsetY;
  });

  // Rotate handle
  elements.handleRotate.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    isRotating = true;
    elements.handleRotate.setPointerCapture(e.pointerId);

    const rect = wrapper.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;

    const currentAngleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    initialRotation = state.transform.rotation - (currentAngleRad * 180 / Math.PI);
  });

  // Corner resize handles
  elements.graphicSelectionBox.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isResizing = true;
      handle.setPointerCapture(e.pointerId);

      startX = e.clientX;
      startY = e.clientY;
      initialScale = state.transform.scale;

      const rect = wrapper.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
    });
  });

  window.addEventListener('pointermove', (e) => {
    if (isDragging) {
      const dx = (e.clientX - startX) / state.zoom;
      const dy = (e.clientY - startY) / state.zoom;
      state.transform.offsetX = Math.round(initialOffsetX + dx);
      state.transform.offsetY = Math.round(initialOffsetY + dy);
      syncTransformSliders();
      updateGraphicDOM();
    } else if (isRotating) {
      const rad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let deg = Math.round((rad * 180 / Math.PI) + initialRotation);
      while (deg > 180) deg -= 360;
      while (deg < -180) deg += 360;
      state.transform.rotation = deg;
      syncTransformSliders();
      updateGraphicDOM();
    } else if (isResizing) {
      const distFromCenter = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const startDist = Math.hypot(startX - centerX, startY - centerY);
      if (startDist > 0) {
        const factor = distFromCenter / startDist;
        const newScale = Math.min(2.2, Math.max(0.15, initialScale * factor));
        state.transform.scale = Number(newScale.toFixed(2));
        syncTransformSliders();
        updateGraphicDOM();
      }
    }
  });

  window.addEventListener('pointerup', () => {
    if (isDragging) {
      isDragging = false;
      wrapper.classList.remove('dragging');
    }
    if (isRotating) isRotating = false;
    if (isResizing) isResizing = false;
  });

  // When clicking outside of the image (unless on corner/rotate handles), hide the sizing framework;
  // clicking inside the image restores it so mockup can be viewed cleanly.
  elements.stageViewport.addEventListener('pointerdown', (e) => {
    if (!state.graphic.src) return;

    const clickedWrapper = elements.graphicTransformWrapper.contains(e.target);
    const clickedHandle = e.target.classList.contains('handle') || e.target.closest('.handle');

    if (clickedWrapper || clickedHandle) {
      elements.graphicSelectionBox.classList.remove('hidden');
    } else {
      elements.graphicSelectionBox.classList.add('hidden');
    }
  });
}

// --- Interactive Print Zone Resizing ---

function setupPrintZoneResizing() {
  let isResizingPZ = false;
  let activeDir = null;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0, initialWidth = 0, initialHeight = 0;

  elements.printZoneGuide.querySelectorAll('.pz-handle').forEach(handle => {
    handle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isResizingPZ = true;
      activeDir = handle.dataset.pzdir;
      handle.setPointerCapture(e.pointerId);

      startX = e.clientX;
      startY = e.clientY;
      initialLeft = state.printArea.left;
      initialTop = state.printArea.top;
      initialWidth = state.printArea.width;
      initialHeight = state.printArea.height;
    });
  });

  window.addEventListener('pointermove', (e) => {
    if (!isResizingPZ) return;
    const stageRect = elements.stageContainer.getBoundingClientRect();
    const dLeftPct = ((e.clientX - startX) / (stageRect.width * state.zoom)) * 100;
    const dTopPct = ((e.clientY - startY) / (stageRect.height * state.zoom)) * 100;

    let newL = initialLeft;
    let newT = initialTop;
    let newW = initialWidth;
    let newH = initialHeight;

    if (activeDir.includes('e')) {
      newW = Math.max(15, Math.min(60, initialWidth + dLeftPct));
    }
    if (activeDir.includes('s') || activeDir === 'b') {
      newH = Math.max(15, Math.min(60, initialHeight + dTopPct));
    }
    if (activeDir.includes('w') || activeDir === 'l') {
      const allowedDW = Math.max(-initialLeft, Math.min(initialWidth - 15, dLeftPct));
      newL = initialLeft + allowedDW;
      newW = initialWidth - allowedDW;
    }
    if (activeDir.includes('n') || activeDir === 't') {
      const allowedDH = Math.max(-initialTop, Math.min(initialHeight - 15, dTopPct));
      newT = initialTop + allowedDH;
      newH = initialHeight - allowedDH;
    }

    state.printArea.left = Number(newL.toFixed(1));
    state.printArea.top = Number(newT.toFixed(1));
    state.printArea.width = Number(newW.toFixed(1));
    state.printArea.height = Number(newH.toFixed(1));

    // Dynamic inches calculation
    const inchesW = ((state.printArea.width / 36) * 12).toFixed(1);
    const inchesH = ((state.printArea.height / 35) * 16).toFixed(1);
    state.printArea.maxInches = `${inchesW}" × ${inchesH}"`;

    applyPrintAreaCoordinates();
  });

  window.addEventListener('pointerup', () => {
    if (isResizingPZ) {
      isResizingPZ = false;
      showToast(`Print Zone resized: ${state.printArea.maxInches}`);
    }
  });
}

// --- Collapsible Panels on Sidebar ---

function setupCollapsiblePanels() {
  document.querySelectorAll('.panel-card').forEach(panel => {
    const header = panel.querySelector('.panel-header');
    if (!header) return;

    const toggle = () => {
      panel.classList.toggle('collapsed');
    };

    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

// --- Advanced Settings & Tech Pack Modal ---

function setupAdvancedModal() {
  const openModal = () => {
    if (elements.advancedModal) {
      elements.advancedModal.classList.remove('hidden');
    }
  };
  const closeModal = () => {
    if (elements.advancedModal) {
      elements.advancedModal.classList.add('hidden');
    }
  };

  if (elements.btnOpenAdvancedModal) {
    elements.btnOpenAdvancedModal.addEventListener('click', openModal);
  }
  if (elements.btnExportSpec) {
    elements.btnExportSpec.addEventListener('click', openModal);
  }
  if (elements.btnCloseAdvancedModal) {
    elements.btnCloseAdvancedModal.addEventListener('click', closeModal);
  }
  if (elements.btnModalDone) {
    elements.btnModalDone.addEventListener('click', closeModal);
  }

  if (elements.advancedModal) {
    elements.advancedModal.addEventListener('click', (e) => {
      if (e.target === elements.advancedModal) closeModal();
    });
  }

  // Fabric finish pills in modal
  if (elements.finishPills) {
    elements.finishPills.querySelectorAll('.finish-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        elements.finishPills.querySelectorAll('.finish-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.fabricFinish = pill.dataset.finish;
        if (state.fabricFinish === 'heather') {
          elements.garmentShadowsImg.style.opacity = '0.70';
          elements.garmentShadowsImg.style.filter = 'contrast(1.15)';
        } else {
          elements.garmentShadowsImg.style.opacity = '0.58';
          elements.garmentShadowsImg.style.filter = 'none';
        }
      });
    });
  }

  // Blend selector in modal
  if (elements.blendSelector) {
    elements.blendSelector.querySelectorAll('.blend-card').forEach(card => {
      card.addEventListener('click', () => {
        elements.blendSelector.querySelectorAll('.blend-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.transform.blendMode = card.dataset.method === 'screenprint' ? 'multiply' : 'normal';
        updateGraphicDOM();
      });
    });
  }
}

// --- Event Listeners ---

function attachEventListeners() {
  // Gender buttons
  elements.genderSelector.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.genderSelector.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.gender = btn.dataset.gender;
      updateModelAndStyle();
    });
  });

  // Ethnicity buttons
  elements.ethnicitySelector.querySelectorAll('.eth-card').forEach(card => {
    card.addEventListener('click', () => {
      elements.ethnicitySelector.querySelectorAll('.eth-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.ethnicity = card.dataset.ethnicity;
      updateModelAndStyle();
    });
  });

  // Skin Depth & Warmth Sliders
  elements.sliderSkinDepth.addEventListener('input', (e) => {
    state.skinDepth = Number(e.target.value);
    if (state.skinDepth === 0) {
      elements.skinDepthVal.textContent = 'Default';
    } else if (state.skinDepth > 0) {
      elements.skinDepthVal.textContent = `+${state.skinDepth} (Fairer)`;
    } else {
      elements.skinDepthVal.textContent = `${state.skinDepth} (Deeper)`;
    }
    applySkinToneFilter();
  });

  elements.sliderSkinWarmth.addEventListener('input', (e) => {
    state.skinWarmth = Number(e.target.value);
    if (state.skinWarmth === 0) {
      elements.skinWarmthVal.textContent = 'Neutral';
    } else if (state.skinWarmth > 0) {
      elements.skinWarmthVal.textContent = `+${state.skinWarmth} (Warm/Gold)`;
    } else {
      elements.skinWarmthVal.textContent = `${state.skinWarmth} (Cool/Rosy)`;
    }
    applySkinToneFilter();
  });

  // Style buttons
  elements.styleSelector.querySelectorAll('.style-card').forEach(card => {
    card.addEventListener('click', () => {
      elements.styleSelector.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.style = card.dataset.style;
      updateModelAndStyle();
    });
  });

  // Flexible Color Category Tabs
  if (elements.colorCategoryTabs) {
    elements.colorCategoryTabs.querySelectorAll('.color-cat-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        elements.colorCategoryTabs.querySelectorAll('.color-cat-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeColorCategory = tab.dataset.cat;
        renderColorSwatches(activeColorCategory);
      });
    });
  }

  // Hue & Lightness Spectrum Sliders
  if (elements.sliderHue && elements.sliderLightness) {
    const handleSliderColorChange = (commitRecent = false) => {
      const h = parseInt(elements.sliderHue.value, 10);
      const l = parseInt(elements.sliderLightness.value, 10);
      if (elements.hueValText) elements.hueValText.textContent = `${h}°`;
      if (elements.lightnessValText) elements.lightnessValText.textContent = `${l}%`;
      const hex = hslToHex(h, 95, l);
      setShirtColor(hex, `Hue ${h}°`);
      if (commitRecent) {
        addRecentColor(hex);
      }
    };

    elements.sliderHue.addEventListener('input', () => handleSliderColorChange(false));
    elements.sliderHue.addEventListener('change', () => handleSliderColorChange(true));
    elements.sliderLightness.addEventListener('input', () => handleSliderColorChange(false));
    elements.sliderLightness.addEventListener('change', () => handleSliderColorChange(true));
  }

  // Custom Color Picker & Hex Input
  elements.nativeColorInput.addEventListener('input', (e) => {
    setShirtColor(e.target.value);
  });
  elements.nativeColorInput.addEventListener('change', (e) => {
    addRecentColor(e.target.value);
  });

  elements.hexInput.addEventListener('input', (e) => {
    let val = e.target.value.trim().replace('#', '');
    if (/^[0-9A-Fa-f]{6}$/.test(val)) {
      setShirtColor(`#${val}`);
    } else if (/^[0-9A-Fa-f]{3}$/.test(val)) {
      setShirtColor(`#${val[0]}${val[0]}${val[1]}${val[1]}${val[2]}${val[2]}`);
    }
  });

  elements.hexInput.addEventListener('change', (e) => {
    let val = e.target.value.trim().replace('#', '');
    if (/^[0-9A-Fa-f]{6}$/.test(val)) {
      addRecentColor(`#${val}`);
    }
  });

  if (window.EyeDropper) {
    elements.btnEyedropper.addEventListener('click', async () => {
      try {
        const dropper = new EyeDropper();
        const res = await dropper.open();
        if (res && res.sRGBHex) {
          setShirtColor(res.sRGBHex);
          addRecentColor(res.sRGBHex);
        }
      } catch (e) {
        // user canceled
      }
    });
  } else {
    elements.btnEyedropper.style.display = 'none';
  }

  // Dropzone
  elements.dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropzone.classList.add('drag-over');
  });

  elements.dropzone.addEventListener('dragleave', () => {
    elements.dropzone.classList.remove('drag-over');
  });

  elements.dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  elements.fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
      e.target.value = '';
    }
  });

  // Remove Artwork
  elements.btnRemoveArtwork.addEventListener('click', clearArtwork);
  elements.btnToolRemove.addEventListener('click', clearArtwork);

  // Position Presets
  elements.presetsRow.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      elements.presetsRow.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyPresetPlacement(chip.dataset.preset);
    });
  });

  // Sliders
  elements.sliderScale.addEventListener('input', (e) => {
    state.transform.scale = Number(e.target.value) / 100;
    elements.scaleValueText.textContent = `${e.target.value}%`;
    updateGraphicDOM();
  });

  elements.sliderRotate.addEventListener('input', (e) => {
    state.transform.rotation = Number(e.target.value);
    elements.rotateValueText.textContent = `${e.target.value}°`;
    updateGraphicDOM();
  });

  elements.sliderOffsetX.addEventListener('input', (e) => {
    state.transform.offsetX = Number(e.target.value);
    elements.offsetXValueText.textContent = `${e.target.value} px`;
    updateGraphicDOM();
  });

  elements.sliderOffsetY.addEventListener('input', (e) => {
    state.transform.offsetY = Number(e.target.value);
    elements.offsetYValueText.textContent = `${e.target.value} px`;
    updateGraphicDOM();
  });

  elements.sliderOpacity.addEventListener('input', (e) => {
    state.transform.opacity = Number(e.target.value) / 100;
    elements.opacityValueText.textContent = `${e.target.value}%`;
    updateGraphicDOM();
  });

  // Flip buttons
  elements.btnFlipH.addEventListener('click', () => {
    state.transform.flipH = !state.transform.flipH;
    elements.btnFlipH.classList.toggle('active', state.transform.flipH);
    updateGraphicDOM();
  });

  elements.btnFlipV.addEventListener('click', () => {
    state.transform.flipV = !state.transform.flipV;
    elements.btnFlipV.classList.toggle('active', state.transform.flipV);
    updateGraphicDOM();
  });

  elements.btnResetTransform.addEventListener('click', () => {
    applyPresetPlacement('center');
  });

  // Quick Artwork Floating Tools (Strictly Centered on Model Chest)
  elements.btnToolCenterX.addEventListener('click', () => {
    state.transform.offsetX = 0;
    syncTransformSliders();
    updateGraphicDOM();
    showToast('Centered horizontally on model chest');
  });

  elements.btnToolCenterY.addEventListener('click', () => {
    state.transform.offsetY = 0;
    syncTransformSliders();
    updateGraphicDOM();
    showToast('Centered vertically on model chest');
  });

  elements.btnToolFitChest.addEventListener('click', () => {
    state.transform.offsetX = 0;
    state.transform.offsetY = 0;
    state.transform.scale = 1.25;
    syncTransformSliders();
    updateGraphicDOM();
    showToast('Fitted to model printable chest');
  });

  // Toggle Printable Guide
  elements.btnToggleGuide.addEventListener('click', () => {
    state.showGuide = !state.showGuide;
    elements.btnToggleGuide.classList.toggle('active', state.showGuide);
    elements.printZoneGuide.classList.toggle('hidden', !state.showGuide);
    elements.guideBtnText.textContent = state.showGuide ? 'Hide Print Zone' : 'Show Print Zone';
  });

  // Zoom Controls
  elements.btnZoomIn.addEventListener('click', () => setZoom(state.zoom + 0.15));
  elements.btnZoomOut.addEventListener('click', () => setZoom(state.zoom - 0.15));
  elements.btnZoomReset.addEventListener('click', () => setZoom(1.0));

  // Export Mockup Action with Exact Mathematical Chest Alignment
  const triggerExportPNG = async () => {
    try {
      showLoading(true);
      const modelConfig = getCurrentModelConfig();

      // Compute exact mathematical canvas position (896 x 1200 px)
      // unaffected by DOM rotation handle bounds or CSS scale zoom
      const stageW = elements.stageContainer.offsetWidth || 560;
      const stageH = elements.stageContainer.offsetHeight || 750;
      const pxRatioX = 896 / stageW;
      const pxRatioY = 1200 / stageH;

      const printCenterX = ((state.printArea.left + state.printArea.width / 2) / 100) * 896;
      const printCenterY = ((state.printArea.top + state.printArea.height / 2) / 100) * 1200;

      const canvasGraphicX = printCenterX + (state.transform.offsetX * pxRatioX);
      const canvasGraphicY = printCenterY + (state.transform.offsetY * pxRatioY);

      const graphicBaseW = elements.userGraphicImg.offsetWidth || 200;
      const graphicBaseH = elements.userGraphicImg.offsetHeight || 200;

      const canvasGraphicW = graphicBaseW * pxRatioX * state.transform.scale;
      const canvasGraphicH = graphicBaseH * pxRatioY * state.transform.scale;

      const filename = `tshirt-${state.gender}-${state.ethnicity}-${state.style}-${state.shirtColor.replace('#', '')}.png`;

      await downloadMockupPNG({
        modelConfig,
        shirtColorHex: state.shirtColor,
        skinToneFilter: calculateCurrentSkinFilter(),
        graphicImgElement: state.graphic.src ? elements.userGraphicImg : null,
        graphicState: {
          canvasCenterX: canvasGraphicX,
          canvasCenterY: canvasGraphicY,
          canvasWidth: canvasGraphicW,
          canvasHeight: canvasGraphicH,
          scale: state.transform.scale,
          rotation: state.transform.rotation,
          flipH: state.transform.flipH,
          flipV: state.transform.flipV,
          blendMode: state.transform.blendMode,
          opacity: state.transform.opacity
        },
        stageDimensions: {
          width: stageW,
          height: stageH
        }
      }, filename);

      showToast('Photorealistic Mockup downloaded (896 × 1200 px)!');
    } catch (err) {
      console.error(err);
      showToast('Export failed. Check console.');
    } finally {
      showLoading(false);
    }
  };

  elements.btnExportMockup.addEventListener('click', triggerExportPNG);
  elements.btnBottomExport.addEventListener('click', triggerExportPNG);

  // Export Spec Action
  const triggerExportSpec = () => {
    const modelConfig = getCurrentModelConfig();
    const ethData = MODELS_CONFIG[state.gender].ethnicities[state.ethnicity];
    const spec = {
      project: 'Atelier T-Shirt Custom Studio',
      timestamp: new Date().toISOString(),
      modelFigure: {
        gender: state.gender,
        genderLabel: MODELS_CONFIG[state.gender].label,
        raceEthnicity: ethData ? ethData.label : 'Fair / Caucasian',
        skinTonePreset: state.skinTone,
        skinToneFilter: calculateCurrentSkinFilter(),
      },
      apparel: {
        style: modelConfig.label,
        fabricColorHex: state.shirtColor,
        fabricFinish: state.fabricFinish,
        printableZone: state.printArea ? state.printArea.maxInches : modelConfig.printArea.maxInches,
      },
      artwork: {
        uploaded: Boolean(state.graphic.src),
        filename: state.graphic.filename,
        format: state.graphic.type,
        dimensions: state.graphic.dimensions,
        isAnimated: state.graphic.isAnimated,
        placement: {
          scalePercent: Math.round(state.transform.scale * 100),
          rotationDegrees: state.transform.rotation,
          offsetXPixels: state.transform.offsetX,
          offsetYPixels: state.transform.offsetY,
          flipHorizontal: state.transform.flipH,
          flipVertical: state.transform.flipV,
          printMethod: state.transform.blendMode === 'multiply' ? 'Direct-to-Garment / Screenprint' : 'Direct-to-Film / Decal',
          opacityPercent: Math.round(state.transform.opacity * 100)
        }
      }
    };
    downloadTechPackJSON(spec, `tshirt-techpack-${state.gender}-${state.ethnicity}-${state.style}.json`);
    showToast('Tech Pack JSON exported!');
  };

  if (elements.btnBottomSpec) {
    elements.btnBottomSpec.addEventListener('click', triggerExportSpec);
  }
}

// --- Zoom Controller ---
function setZoom(val) {
  state.zoom = Math.min(1.8, Math.max(0.65, val));
  elements.stageContainer.style.transform = `scale(${state.zoom})`;
  elements.zoomLevelText.textContent = `${Math.round(state.zoom * 100)}%`;
}

// --- Helpers ---
function showLoading(show) {
  elements.stageLoadingOverlay.classList.toggle('hidden', !show);
}

let toastTimer = null;
function showToast(msg) {
  elements.toastMessage.textContent = msg;
  elements.toastNotification.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toastNotification.classList.add('hidden');
  }, 3500);
}

// Start application
window.addEventListener('DOMContentLoaded', init);
