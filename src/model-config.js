// Model configuration with calibration for human figures, ethnicities, skin tones, and styles

export const ETHNICITY_OPTIONS = [
  { id: 'caucasian', label: 'Fair / Caucasian', desc: 'Light / European features' },
  { id: 'black', label: 'Black / African', desc: 'Deep / African descent' },
  { id: 'asian', label: 'Asian / East Asian', desc: 'Warm / East Asian features' }
];

export const SKIN_TONE_PRESETS = [
  { id: 'natural', name: 'Natural Studio Tone', filter: 'none', swatchHex: '#E2B89D' },
  { id: 'fair', name: 'Fair / Porcelain', filter: 'brightness(1.08) saturate(0.92) contrast(0.98)', swatchHex: '#FCE7D9' },
  { id: 'warm', name: 'Warm Ivory', filter: 'sepia(0.12) brightness(1.02) saturate(1.10)', swatchHex: '#E5C5A6' },
  { id: 'olive', name: 'Golden Olive', filter: 'sepia(0.22) saturate(1.18) hue-rotate(-6deg)', swatchHex: '#CFA77B' },
  { id: 'bronze', name: 'Sun-Kissed Bronze', filter: 'sepia(0.28) brightness(0.92) saturate(1.22) contrast(1.05) hue-rotate(-10deg)', swatchHex: '#A5734A' },
  { id: 'caramel', name: 'Rich Caramel', filter: 'sepia(0.36) brightness(0.78) saturate(1.25) contrast(1.12) hue-rotate(-12deg)', swatchHex: '#7C4B27' },
  { id: 'espresso', name: 'Deep Espresso', filter: 'sepia(0.44) brightness(0.60) saturate(1.18) contrast(1.18) hue-rotate(-15deg)', swatchHex: '#452615' },
];

export const MODELS_CONFIG = {
  male: {
    label: 'Male Model',
    ethnicities: {
      caucasian: {
        label: 'Fair / Caucasian',
        styles: {
          crew: {
            label: 'Round Neck (Crew)',
            baseImage: '/assets/models/male_crew.jpg',
            shirtImage: '/assets/models/male_crew_shirt.png',
            maskImage: '/assets/models/male_crew_mask.png',
            shadowsImage: '/assets/models/male_crew_shadows.png',
            printArea: { left: 32, top: 35, width: 36, height: 35, maxInches: '12" × 16"' }
          },
          vneck: {
            label: 'V-Neck',
            baseImage: '/assets/models/male_vneck.jpg',
            shirtImage: '/assets/models/male_vneck_shirt.png',
            maskImage: '/assets/models/male_vneck_mask.png',
            shadowsImage: '/assets/models/male_vneck_shadows.png',
            printArea: { left: 32.5, top: 38, width: 35, height: 34, maxInches: '12" × 15"' }
          },
          vest: {
            label: 'Vest Top (Tank)',
            baseImage: '/assets/models/male_vest.jpg',
            shirtImage: '/assets/models/male_vest_shirt.png',
            maskImage: '/assets/models/male_vest_mask.png',
            shadowsImage: '/assets/models/male_vest_shadows.png',
            printArea: { left: 34, top: 38, width: 32, height: 35, maxInches: '11" × 15"' }
          }
        }
      },
      black: {
        label: 'Black / African',
        styles: {
          crew: {
            label: 'Round Neck (Crew)',
            baseImage: '/assets/models/male_black_crew.jpg',
            shirtImage: '/assets/models/male_black_crew_shirt.png',
            maskImage: '/assets/models/male_black_crew_mask.png',
            shadowsImage: '/assets/models/male_black_crew_shadows.png',
            printArea: { left: 32, top: 36, width: 36, height: 35, maxInches: '12" × 16"' }
          },
          vneck: {
            label: 'V-Neck',
            baseImage: '/assets/models/male_black_vneck.jpg',
            shirtImage: '/assets/models/male_black_vneck_shirt.png',
            maskImage: '/assets/models/male_black_vneck_mask.png',
            shadowsImage: '/assets/models/male_black_vneck_shadows.png',
            printArea: { left: 32.5, top: 38, width: 35, height: 34, maxInches: '12" × 15"' }
          },
          vest: {
            label: 'Vest Top (Tank)',
            baseImage: '/assets/models/male_black_vest.jpg',
            shirtImage: '/assets/models/male_black_vest_shirt.png',
            maskImage: '/assets/models/male_black_vest_mask.png',
            shadowsImage: '/assets/models/male_black_vest_shadows.png',
            printArea: { left: 33, top: 38, width: 34, height: 35, maxInches: '11" × 15"' }
          }
        }
      },
      asian: {
        label: 'Asian / East Asian',
        styles: {
          crew: {
            label: 'Round Neck (Crew)',
            baseImage: '/assets/models/male_asian_crew.jpg',
            shirtImage: '/assets/models/male_asian_crew_shirt.png',
            maskImage: '/assets/models/male_asian_crew_mask.png',
            shadowsImage: '/assets/models/male_asian_crew_shadows.png',
            printArea: { left: 32, top: 36, width: 36, height: 35, maxInches: '12" × 16"' }
          },
          vneck: {
            label: 'V-Neck',
            baseImage: '/assets/models/male_asian_crew.jpg',
            shirtImage: '/assets/models/male_asian_crew_shirt.png',
            maskImage: '/assets/models/male_asian_crew_mask.png',
            shadowsImage: '/assets/models/male_asian_crew_shadows.png',
            printArea: { left: 32, top: 38, width: 35, height: 34, maxInches: '12" × 15"' }
          },
          vest: {
            label: 'Vest Top (Tank)',
            baseImage: '/assets/models/male_asian_crew.jpg',
            shirtImage: '/assets/models/male_asian_crew_shirt.png',
            maskImage: '/assets/models/male_asian_crew_mask.png',
            shadowsImage: '/assets/models/male_asian_crew_shadows.png',
            printArea: { left: 33, top: 38, width: 34, height: 35, maxInches: '11" × 15"' }
          }
        }
      }
    }
  },
  female: {
    label: 'Female Model',
    ethnicities: {
      caucasian: {
        label: 'Fair / Caucasian',
        styles: {
          crew: {
            label: 'Round Neck (Crew)',
            baseImage: '/assets/models/female_crew.jpg',
            shirtImage: '/assets/models/female_crew_shirt.png',
            maskImage: '/assets/models/female_crew_mask.png',
            shadowsImage: '/assets/models/female_crew_shadows.png',
            printArea: { left: 33.5, top: 38, width: 33, height: 32, maxInches: '11" × 14"' }
          },
          vneck: {
            label: 'V-Neck',
            baseImage: '/assets/models/female_vneck.jpg',
            shirtImage: '/assets/models/female_vneck_shirt.png',
            maskImage: '/assets/models/female_vneck_mask.png',
            shadowsImage: '/assets/models/female_vneck_shadows.png',
            printArea: { left: 34, top: 41, width: 32, height: 31, maxInches: '11" × 13.5"' }
          },
          vest: {
            label: 'Vest Top (Tank)',
            baseImage: '/assets/models/female_vest.jpg',
            shirtImage: '/assets/models/female_vest_shirt.png',
            maskImage: '/assets/models/female_vest_mask.png',
            shadowsImage: '/assets/models/female_vest_shadows.png',
            printArea: { left: 34.5, top: 41, width: 31, height: 32, maxInches: '10.5" × 14"' }
          }
        }
      },
      black: {
        label: 'Black / African',
        styles: {
          crew: {
            label: 'Round Neck (Crew)',
            baseImage: '/assets/models/female_black_crew.jpg',
            shirtImage: '/assets/models/female_black_crew_shirt.png',
            maskImage: '/assets/models/female_black_crew_mask.png',
            shadowsImage: '/assets/models/female_black_crew_shadows.png',
            printArea: { left: 33.5, top: 39, width: 33, height: 33, maxInches: '11" × 14"' }
          },
          vneck: {
            label: 'V-Neck',
            baseImage: '/assets/models/female_black_crew.jpg',
            shirtImage: '/assets/models/female_black_crew_shirt.png',
            maskImage: '/assets/models/female_black_crew_mask.png',
            shadowsImage: '/assets/models/female_black_crew_shadows.png',
            printArea: { left: 34, top: 41, width: 32, height: 31, maxInches: '11" × 13.5"' }
          },
          vest: {
            label: 'Vest Top (Tank)',
            baseImage: '/assets/models/female_black_vest.jpg',
            shirtImage: '/assets/models/female_black_vest_shirt.png',
            maskImage: '/assets/models/female_black_vest_mask.png',
            shadowsImage: '/assets/models/female_black_vest_shadows.png',
            printArea: { left: 34.5, top: 41, width: 31, height: 32, maxInches: '10.5" × 14"' }
          }
        }
      },
      asian: {
        label: 'Asian / East Asian',
        styles: {
          crew: {
            label: 'Round Neck (Crew)',
            baseImage: '/assets/models/female_asian_crew.jpg',
            shirtImage: '/assets/models/female_asian_crew_shirt.png',
            maskImage: '/assets/models/female_asian_crew_mask.png',
            shadowsImage: '/assets/models/female_asian_crew_shadows.png',
            printArea: { left: 33.5, top: 39, width: 33, height: 33, maxInches: '11" × 14"' }
          },
          vneck: {
            label: 'V-Neck',
            baseImage: '/assets/models/female_asian_crew.jpg',
            shirtImage: '/assets/models/female_asian_crew_shirt.png',
            maskImage: '/assets/models/female_asian_crew_mask.png',
            shadowsImage: '/assets/models/female_asian_crew_shadows.png',
            printArea: { left: 34, top: 41, width: 32, height: 31, maxInches: '11" × 13.5"' }
          },
          vest: {
            label: 'Vest Top (Tank)',
            baseImage: '/assets/models/female_asian_crew.jpg',
            shirtImage: '/assets/models/female_asian_crew_shirt.png',
            maskImage: '/assets/models/female_asian_crew_mask.png',
            shadowsImage: '/assets/models/female_asian_crew_shadows.png',
            printArea: { left: 34.5, top: 41, width: 31, height: 32, maxInches: '10.5" × 14"' }
          }
        }
      }
    }
  }
};

export const COLOR_SWATCHES = [
  { name: 'Crisp White', hex: '#FFFFFF', isDark: false },
  { name: 'Obsidian Black', hex: '#18181B', isDark: true },
  { name: 'Heather Slate', hex: '#475569', isDark: true },
  { name: 'Midnight Navy', hex: '#1E293B', isDark: true },
  { name: 'Crimson Red', hex: '#B91C1C', isDark: true },
  { name: 'Forest Pine', hex: '#15803D', isDark: true },
  { name: 'Royal Cobalt', hex: '#1D4ED8', isDark: true },
  { name: 'Pastel Lavender', hex: '#C084FC', isDark: false },
  { name: 'Sunset Coral', hex: '#F97316', isDark: false },
  { name: 'Desert Sand', hex: '#D97706', isDark: false },
  { name: 'Olive Drab', hex: '#4D7C0F', isDark: true },
  { name: 'Rose Quartz', hex: '#F43F5E', isDark: false },
];

export const SAMPLE_GRAPHICS = [
  {
    name: 'North Peak',
    type: 'PNG',
    url: '/assets/samples/north_peak.png',
    desc: 'Vintage Outdoor Badge',
    isAnimated: false,
  },
  {
    name: 'Cyberpunk 2088',
    type: 'WEBP',
    url: '/assets/samples/cyber_emblem.webp',
    desc: 'Futuristic Cyber Emblem',
    isAnimated: false,
  },
  {
    name: 'Pulse Wave',
    type: 'GIF',
    url: '/assets/samples/pulse_wave.gif',
    desc: 'Live Animated Graphic',
    isAnimated: true,
  },
  {
    name: 'Brooklyn NYC',
    type: 'JPEG',
    url: '/assets/samples/brooklyn.jpg',
    desc: 'Classic Typography Print',
    isAnimated: false,
  },
];
