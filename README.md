# Atelier T-Shirt Builder & Mockup Studio

A web application for designing and modeling custom t-shirts on realistic male and female figures.

## Features

- **Human Figure Models**:
  - Photorealistic **Male** and **Female** models in clean studio lighting.
  - Seamless switching between model figures with instant apparel realignment.

- **Configurable Garment Silhouettes**:
  - **Round Neck (Crew Neck)**: Classic streetwear cut.
  - **V-Neck**: Modern tailored V-neck cut.
  - **Vest Top (Tank Top)**: Sleeveless athletic cut.

- **Dynamic Garment Recoloring & Real Fabric Shading**:
  - 12 curated fashion swatches (Obsidian Black, Crisp White, Midnight Navy, Crimson Red, Forest Green, Pastel Lavender, Sunset Coral, Heather Slate, etc.).
  - Custom Hex input, real-time native color picker, and Eyedropper support.
  - Multi-layer cloth crease shading: shadows and wrinkles cast over colors and artwork.
  - Highlights sheen layer calibrated for dark garments (black, charcoal, navy).

- **Multi-Format Artwork Upload & Engine**:
  - Supports **GIF (including animated GIFs playing live on the shirt!)**, **JPEG**, **WebP**, and **PNG**.
  - Drag-and-drop file dropzone with instant preview and file metadata (dimensions, size, format).
  - Bundled sample artwork presets (Vintage Outdoor PNG, Cyberpunk WebP, Live Pulse Wave Animated GIF, Brooklyn Typography JPEG).

- **On-Garment Direct Manipulation & Placement Controls**:
  - Pointer drag to move artwork freely across the chest.
  - Interactive handles to scale and rotate directly on stage.
  - Fine-tuning sliders: Scale (15%–220%), Rotation (-180° to +180°), Offset X, Offset Y, Opacity.
  - Quick presets: Center Chest, Pocket Crest, Streetwear Large, Collar Micro.
  - Flip Horizontal & Flip Vertical.
  - Print method selector: Screenprint / DTG (organic fabric blend) vs Direct-to-Film / Decal (vibrant opaque).
  - Toggleable Printable Zone boundary with dimensions badge.

- **High-Resolution Export**:
  - Export 896 × 1200 photorealistic PNG mockup.
  - Export Tech Pack JSON specification with exact coordinate offsets, garment details, and hex codes.

## Quick Start

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build production bundle
npm run build
```
