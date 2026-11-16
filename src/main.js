// Atelier T-Shirt Studio — Main Application Controller

import { MODELS_CONFIG, COLOR_SWATCHES, SAMPLE_GRAPHICS } from './model-config.js';
import { getLuminance, downloadMockupPNG, downloadTechPackJSON } from './canvas-exporter.js';

// --- State ---
const state = {
  gender: 'male',
  style: 'crew',
  shirtColor: '#FFFFFF',
  fabricFinish: 'cotton', // 'cotton' or 'vintage'
  zoom: 1.0,
  showGuide: true,
  
  // Artwork state
  graphic: {
    src: null,
    filename: null,
    type: null,
    dimensions: { width: 0, height: 0 },
    sizeText: '',
    isAnimated: false,
  },

  // Transform state
  transform: {
    scale: 1.0,
    rotation: 0,
    offsetX: 0, // px from print area center
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
  btnExportMockup: document.getElementById('btnExportMockup'),
  btnExportSpec: document.getElementById('btnExportSpec'),

  // Stage Viewport & Layers
  stageViewport: document.getElementById('stageViewport'),
  stageContainer: document.getElementById('stageContainer'),
  modelBaseImg: document.getElementById('modelBaseImg'),
  garmentColorLayer: document.getElementById('garmentColorLayer'),
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

  // Sidebar: Model & Style
  genderSelector: document.getElementById('genderSelector'),
  styleSelector: document.getElementById('styleSelector'),

  // Sidebar: Color
  colorSwatchesGrid: document.getElementById('colorSwatchesGrid'),
  nativeColorInput: document.getElementById('nativeColorInput'),
  colorPreviewBox: document.getElementById('colorPreviewBox'),
  hexInput: document.getElementById('hexInput'),
  btnEyedropper: document.getElementById('btnEyedropper'),
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
  specSummaryColor: document.getElementById('specSummaryColor'),
  specSummaryArt: document.getElementById('specSummaryArt'),
  specSummaryZone: document.getElementById('specSummaryZone'),
  btnBottomExport: document.getElementById('btnBottomExport'),
  btnBottomSpec: document.getElementById('btnBottomSpec'),

  // Toast
  toastNotification: document.getElementById('toastNotification'),
  toastMessage: document.getElementById('toastMessage'),
};

// --- Initialization ---
function init() {
  renderColorSwatches();
  renderSampleArtworks();
  attachEventListeners();
  setupDirectManipulation();
  
  // Set default model and load default artwork
  updateModelAndStyle();
  loadSampleArtwork(SAMPLE_GRAPHICS[0]); // Load North Peak default
}

// --- Render Helpers ---

function renderColorSwatches() {
  elements.colorSwatchesGrid.innerHTML = '';
  COLOR_SWATCHES.forEach(swatch => {
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

// --- Model & Style Management ---

function getCurrentModelConfig() {
  return MODELS_CONFIG[state.gender].styles[state.style];
}

function updateModelAndStyle() {
  const modelConfig = getCurrentModelConfig();
  
  // Preload and switch layers
  elements.modelBaseImg.src = modelConfig.baseImage;
  elements.garmentHighlightsImg.src = modelConfig.shadowsImage;
  elements.garmentShadowsImg.src = modelConfig.shadowsImage;

  // Mask for garment coloring
  const maskUrl = `url('${modelConfig.maskImage}')`;
  elements.garmentColorLayer.style.maskImage = maskUrl;
  elements.garmentColorLayer.style.webkitMaskImage = maskUrl;

  // Update print area calibration
  const { left, top, width, height, maxInches } = modelConfig.printArea;
  elements.stageContainer.style.setProperty('--print-left', `${left}%`);
  elements.stageContainer.style.setProperty('--print-top', `${top}%`);
  elements.stageContainer.style.setProperty('--print-width', `${width}%`);
  elements.stageContainer.style.setProperty('--print-height', `${height}%`);

  elements.guideBadge.textContent = `Print Zone • ${maxInches}`;

  // Update headers and summary
  const genderLabel = MODELS_CONFIG[state.gender].label;
  const styleLabel = modelConfig.label;
  elements.headerModelLabel.textContent = genderLabel;
  elements.headerStyleLabel.textContent = styleLabel;
  elements.specSummaryGarment.textContent = `${genderLabel} • ${styleLabel}`;
  elements.specSummaryZone.textContent = `Chest Center • ${maxInches}`;

  // Re-apply garment color
  applyGarmentColor();
  updateGraphicDOM();
}

// --- Garment Color & Texture ---

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

  // Update active swatch button
  document.querySelectorAll('.swatch-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.hex.toLowerCase() === hex.toLowerCase());
  });

  applyGarmentColor();
}

function applyGarmentColor() {
  elements.stageContainer.style.setProperty('--shirt-color', state.shirtColor);

  // Luminance calculation:
  // For deep dark colors (black, navy, slate), enable subtle highlight sheen layer
  const lum = getLuminance(state.shirtColor);
  let sheen = 0;
  if (lum < 0.35) {
    sheen = (1.0 - lum) * 0.45;
  }
  elements.stageContainer.style.setProperty('--sheen-opacity', sheen);

  // If shirt is pure white, multiply mode looks exact; for colored shirts, multiply blends naturally
  // Also adjust graphic blend mode preview if graphic is set to multiply
  if (state.transform.blendMode === 'multiply') {
    // on very dark shirts, pure multiply can make black ink disappear into black fabric
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
      // Calculate file size text
      let sizeStr = '';
      if (file.size > 1024 * 1024) {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      } else {
        sizeStr = `${Math.round(file.size / 1024)} KB`;
      }

      // Determine extension/type
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
      // Uncheck sample cards
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

  // Update DOM Image
  elements.userGraphicImg.src = src;

  // Compute natural aspect ratio and base display size inside print zone
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

  // Reset transforms
  state.transform.offsetX = 0;
  state.transform.offsetY = 0;
  state.transform.rotation = 0;
  state.transform.scale = 1.0;
  state.transform.flipH = false;
  state.transform.flipV = false;

  syncTransformSliders();
  updateGraphicDOM();

  // Update Meta Card
  elements.metaThumbImg.src = src;
  elements.metaFileName.textContent = filename;
  elements.metaDimensions.textContent = `${dimensions.width} × ${dimensions.height} px`;
  elements.metaFileSize.textContent = sizeText;
  elements.metaFileType.textContent = type;
  elements.metaAnimBadge.classList.toggle('hidden', !isAnimated);
  elements.graphicMetaCard.classList.remove('hidden');

  // Update Summary Table & Stage Tools
  elements.specSummaryArt.textContent = `${filename} (${type})`;
  elements.stageArtworkTools.classList.remove('hidden');
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
  elements.specSummaryArt.textContent = 'None';
  document.querySelectorAll('.sample-card').forEach(c => c.classList.remove('active'));
}

// --- Placement & Transform Controls ---

function updateGraphicDOM() {
  if (!state.graphic.src) {
    elements.graphicTransformWrapper.style.display = 'none';
    return;
  }
  elements.graphicTransformWrapper.style.display = 'flex';

  const { scale, rotation, offsetX, offsetY, flipH, flipV, blendMode, opacity } = state.transform;

  const scaleX = flipH ? -scale : scale;
  const scaleY = flipV ? -scale : scale;

  elements.graphicTransformWrapper.style.transform = `
    translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))
    rotate(${rotation}deg)
    scale(${scaleX}, ${scaleY})
  `;

  elements.userGraphicImg.style.opacity = opacity;

  // Screenprint blend mode
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
  const currentModel = getCurrentModelConfig();
  switch (preset) {
    case 'center':
      state.transform.offsetX = 0;
      state.transform.offsetY = 0;
      state.transform.scale = 1.0;
      state.transform.rotation = 0;
      break;
    case 'pocket':
      // Move to left chest / crest position
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

// --- Direct Manipulation (Mouse & Touch Drag / Rotate / Resize) ---

function setupDirectManipulation() {
  let isDragging = false;
  let isRotating = false;
  let isResizing = false;
  let resizeDir = null;

  let startX = 0;
  let startY = 0;
  let initialOffsetX = 0;
  let initialOffsetY = 0;
  let initialScale = 1.0;
  let initialRotation = 0;
  let centerX = 0;
  let centerY = 0;

  const wrapper = elements.graphicTransformWrapper;

  // Main wrapper drag
  wrapper.addEventListener('pointerdown', (e) => {
    // If clicking a handle, don't trigger wrapper drag
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

  // Rotation Handle
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

  // Resize Handles
  document.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isResizing = true;
      resizeDir = handle.dataset.dir;
      handle.setPointerCapture(e.pointerId);

      startX = e.clientX;
      startY = e.clientY;
      initialScale = state.transform.scale;

      const rect = wrapper.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
    });
  });

  // Pointer Move
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
      // Normalize to -180 .. 180
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

  // Pointer Up
  window.addEventListener('pointerup', () => {
    if (isDragging) {
      isDragging = false;
      wrapper.classList.remove('dragging');
    }
    if (isRotating) isRotating = false;
    if (isResizing) isResizing = false;
  });
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

  // Style buttons
  elements.styleSelector.querySelectorAll('.style-card').forEach(card => {
    card.addEventListener('click', () => {
      elements.styleSelector.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.style = card.dataset.style;
      updateModelAndStyle();
    });
  });

  // Custom Color Picker & Inputs
  elements.nativeColorInput.addEventListener('input', (e) => {
    setShirtColor(e.target.value);
  });

  elements.hexInput.addEventListener('change', (e) => {
    let val = e.target.value.trim().replace('#', '');
    if (/^[0-9A-Fa-f]{6}$/.test(val)) {
      setShirtColor(`#${val}`);
    } else if (/^[0-9A-Fa-f]{3}$/.test(val)) {
      setShirtColor(`#${val[0]}${val[0]}${val[1]}${val[1]}${val[2]}${val[2]}`);
    }
  });

  // EyeDropper API (if supported)
  if (window.EyeDropper) {
    elements.btnEyedropper.addEventListener('click', async () => {
      try {
        const dropper = new EyeDropper();
        const res = await dropper.open();
        if (res && res.sRGBHex) {
          setShirtColor(res.sRGBHex);
        }
      } catch (e) {
        // user canceled eyedropper
      }
    });
  } else {
    elements.btnEyedropper.style.display = 'none';
  }

  // Fabric finish pills
  elements.finishPills.querySelectorAll('.finish-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      elements.finishPills.querySelectorAll('.finish-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.fabricFinish = pill.dataset.finish;
      if (state.fabricFinish === 'vintage') {
        elements.garmentShadowsImg.style.opacity = '0.75';
        elements.garmentShadowsImg.style.filter = 'contrast(1.2)';
      } else {
        elements.garmentShadowsImg.style.opacity = '0.58';
        elements.garmentShadowsImg.style.filter = 'none';
      }
    });
  });

  // Drag and Drop Zone
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
      e.target.value = ''; // allow re-upload of same file
    }
  });

  // Remove Artwork Button
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

  // Blend Mode
  elements.blendSelector.querySelectorAll('.blend-card').forEach(card => {
    card.addEventListener('click', () => {
      elements.blendSelector.querySelectorAll('.blend-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.transform.blendMode = card.dataset.blend;
      updateGraphicDOM();
    });
  });

  // Quick Artwork Floating Tools
  elements.btnToolCenterX.addEventListener('click', () => {
    state.transform.offsetX = 0;
    syncTransformSliders();
    updateGraphicDOM();
  });

  elements.btnToolCenterY.addEventListener('click', () => {
    state.transform.offsetY = 0;
    syncTransformSliders();
    updateGraphicDOM();
  });

  elements.btnToolFitChest.addEventListener('click', () => {
    state.transform.offsetX = 0;
    state.transform.offsetY = 0;
    state.transform.scale = 1.35;
    syncTransformSliders();
    updateGraphicDOM();
  });

  // Toggle Printable Guide
  elements.btnToggleGuide.addEventListener('click', () => {
    state.showGuide = !state.showGuide;
    elements.btnToggleGuide.classList.toggle('active', state.showGuide);
    elements.printZoneGuide.classList.toggle('hidden', !state.showGuide);
    elements.graphicSelectionBox.classList.toggle('hidden', !state.showGuide);
  });

  // Zoom Controls
  elements.btnZoomIn.addEventListener('click', () => setZoom(state.zoom + 0.15));
  elements.btnZoomOut.addEventListener('click', () => setZoom(state.zoom - 0.15));
  elements.btnZoomReset.addEventListener('click', () => setZoom(1.0));

  // Export Mockup Action
  const triggerExportPNG = async () => {
    try {
      showLoading(true);
      const modelConfig = getCurrentModelConfig();
      const stageRect = elements.stageContainer.getBoundingClientRect();
      const printZoneRect = elements.printAreaContainer.getBoundingClientRect();

      // Convert wrapper offset to stage coordinates
      const graphicRect = elements.graphicTransformWrapper.getBoundingClientRect();
      const graphicCenterX = graphicRect.left + graphicRect.width / 2 - stageRect.left;
      const graphicCenterY = graphicRect.top + graphicRect.height / 2 - stageRect.top;

      const imgWidth = elements.userGraphicImg.naturalWidth || elements.userGraphicImg.clientWidth;
      const imgHeight = elements.userGraphicImg.naturalHeight || elements.userGraphicImg.clientHeight;

      const filename = `tshirt-${state.gender}-${state.style}-${state.shirtColor.replace('#', '')}.png`;

      await downloadMockupPNG({
        modelConfig,
        shirtColorHex: state.shirtColor,
        graphicImgElement: state.graphic.src ? elements.userGraphicImg : null,
        graphicState: {
          x: graphicCenterX,
          y: graphicCenterY,
          width: elements.userGraphicImg.clientWidth || 200,
          height: elements.userGraphicImg.clientHeight || 200,
          scale: state.transform.scale,
          rotation: state.transform.rotation,
          flipH: state.transform.flipH,
          flipV: state.transform.flipV,
          blendMode: state.transform.blendMode,
          opacity: state.transform.opacity
        },
        stageDimensions: {
          width: stageRect.width,
          height: stageRect.height
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
    const spec = {
      project: 'Atelier T-Shirt Custom Studio',
      timestamp: new Date().toISOString(),
      apparel: {
        model: MODELS_CONFIG[state.gender].label,
        gender: state.gender,
        style: modelConfig.label,
        fabricColorHex: state.shirtColor,
        fabricFinish: state.fabricFinish,
        printableZone: modelConfig.printArea.maxInches,
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
    downloadTechPackJSON(spec, `tshirt-techpack-${state.gender}-${state.style}.json`);
    showToast('Tech Pack JSON exported!');
  };

  elements.btnExportSpec.addEventListener('click', triggerExportSpec);
  elements.btnBottomSpec.addEventListener('click', triggerExportSpec);
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
