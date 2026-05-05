import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Sleek Midnight Neon Palette ── */
        primary: '#00e5ff',
        'primary-container': '#00333a',
        'primary-fixed': '#b0fbff',
        'primary-fixed-dim': '#00e5ff',
        'on-primary': '#00363d',
        'on-primary-container': '#b0fbff',

        secondary: '#b388ff',
        'secondary-container': '#321c54',
        'secondary-fixed': '#e6d4ff',
        'secondary-fixed-dim': '#b388ff',
        'on-secondary': '#23005c',
        'on-secondary-container': '#e6d4ff',

        tertiary: '#00e676',
        'tertiary-container': '#003318',
        'tertiary-fixed': '#70ffaa',
        'tertiary-fixed-dim': '#00e676',
        'on-tertiary': '#00391a',
        'on-tertiary-container': '#70ffaa',

        error: '#ff1744',
        'error-container': '#4a000d',
        'on-error': '#690013',
        'on-error-container': '#ffd9df',

        background: '#050505',
        'on-background': '#e3e3e3',
        surface: '#0a0a0a',
        'on-surface': '#e3e3e3',
        'surface-bright': '#1f1f1f',
        'surface-dim': '#050505',
        'surface-tint': '#00e5ff',
        'surface-variant': '#1a1a1a',
        'on-surface-variant': '#a3a3a3',

        'surface-container-lowest': '#000000',
        'surface-container-low': '#0a0a0a',
        'surface-container': '#121212',
        'surface-container-high': '#1a1a1a',
        'surface-container-highest': '#242424',

        outline: '#404040',
        'outline-variant': '#262626',
        'inverse-surface': '#e3e3e3',
        'inverse-on-surface': '#0f0f0f',
        'inverse-primary': '#006975',
      },
      fontFamily: {
        headline: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
        full: '9999px',
      },
      boxShadow: {
        'neon-primary': '0 0 20px rgba(0, 229, 255, 0.4)',
        'neon-tertiary': '0 0 20px rgba(0, 230, 118, 0.4)',
        'neon-secondary': '0 0 20px rgba(179, 136, 255, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        nutriar: {
          "primary": "#00e5ff",
          "secondary": "#b388ff",
          "accent": "#00e676",
          "neutral": "#121212",
          "base-100": "#050505",
          "info": "#00e5ff",
          "success": "#00e676",
          "warning": "#ffea00",
          "error": "#ff1744",
        },
      },
    ],
  },
};
