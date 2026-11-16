// Model configuration with calibration for each human figure and t-shirt style

export const MODELS_CONFIG = {
  male: {
    label: 'Male Model',
    styles: {
      crew: {
        label: 'Round Neck (Crew)',
        baseImage: '/assets/models/male_crew.jpg',
        shirtImage: '/assets/models/male_crew_shirt.png',
        maskImage: '/assets/models/male_crew_mask.png',
        shadowsImage: '/assets/models/male_crew_shadows.png',
        printArea: {
          left: 32, // percentage of stage width
          top: 35,  // percentage of stage height
          width: 36, // percentage of stage width
          height: 35, // percentage of stage height
          maxInches: '12" × 16"',
        },
        pocketArea: {
          left: 54,
          top: 40,
          width: 14,
          height: 14,
        }
      },
      vneck: {
        label: 'V-Neck',
        baseImage: '/assets/models/male_vneck.jpg',
        shirtImage: '/assets/models/male_vneck_shirt.png',
        maskImage: '/assets/models/male_vneck_mask.png',
        shadowsImage: '/assets/models/male_vneck_shadows.png',
        printArea: {
          left: 32.5,
          top: 38,
          width: 35,
          height: 34,
          maxInches: '12" × 15"',
        },
        pocketArea: {
          left: 53,
          top: 43,
          width: 13,
          height: 13,
        }
      },
      vest: {
        label: 'Vest Top (Tank)',
        baseImage: '/assets/models/male_vest.jpg',
        shirtImage: '/assets/models/male_vest_shirt.png',
        maskImage: '/assets/models/male_vest_mask.png',
        shadowsImage: '/assets/models/male_vest_shadows.png',
        printArea: {
          left: 34,
          top: 38,
          width: 32,
          height: 35,
          maxInches: '11" × 15"',
        },
        pocketArea: {
          left: 52,
          top: 42,
          width: 13,
          height: 13,
        }
      }
    }
  },
  female: {
    label: 'Female Model',
    styles: {
      crew: {
        label: 'Round Neck (Crew)',
        baseImage: '/assets/models/female_crew.jpg',
        shirtImage: '/assets/models/female_crew_shirt.png',
        maskImage: '/assets/models/female_crew_mask.png',
        shadowsImage: '/assets/models/female_crew_shadows.png',
        printArea: {
          left: 33.5,
          top: 38,
          width: 33,
          height: 32,
          maxInches: '11" × 14"',
        },
        pocketArea: {
          left: 53,
          top: 42,
          width: 12,
          height: 12,
        }
      },
      vneck: {
        label: 'V-Neck',
        baseImage: '/assets/models/female_vneck.jpg',
        shirtImage: '/assets/models/female_vneck_shirt.png',
        maskImage: '/assets/models/female_vneck_mask.png',
        shadowsImage: '/assets/models/female_vneck_shadows.png',
        printArea: {
          left: 34,
          top: 41,
          width: 32,
          height: 31,
          maxInches: '11" × 13.5"',
        },
        pocketArea: {
          left: 52,
          top: 44,
          width: 12,
          height: 12,
        }
      },
      vest: {
        label: 'Vest Top (Tank)',
        baseImage: '/assets/models/female_vest.jpg',
        shirtImage: '/assets/models/female_vest_shirt.png',
        maskImage: '/assets/models/female_vest_mask.png',
        shadowsImage: '/assets/models/female_vest_shadows.png',
        printArea: {
          left: 34.5,
          top: 41,
          width: 31,
          height: 32,
          maxInches: '10.5" × 14"',
        },
        pocketArea: {
          left: 52,
          top: 44,
          width: 12,
          height: 12,
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
