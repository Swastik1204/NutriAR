import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Terra Palette (Material Design 3 Organic) ── */
        primary: '#4a7c59',
        'primary-container': '#78a886',
        'primary-fixed': '#c8e8d0',
        'primary-fixed-dim': '#8ecf9e',
        'on-primary': '#ffffff',
        'on-primary-container': '#d8f0de',
        'on-primary-fixed': '#002110',
        'on-primary-fixed-variant': '#2a6038',

        secondary: '#6b6358',
        'secondary-container': '#f0e8db',
        'secondary-fixed': '#f0e8db',
        'secondary-fixed-dim': '#d4ccbf',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#5e5548',
        'on-secondary-fixed': '#1e1a13',
        'on-secondary-fixed-variant': '#4a4538',

        tertiary: '#705c30',
        'tertiary-container': '#c4a66a',
        'tertiary-fixed': '#f8e0a8',
        'tertiary-fixed-dim': '#dcc48e',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#554020',
        'on-tertiary-fixed': '#221a05',
        'on-tertiary-fixed-variant': '#554020',

        error: '#b83230',
        'error-container': '#ffdad8',
        'on-error': '#ffffff',
        'on-error-container': '#690005',

        background: '#faf6f0',
        'on-background': '#2e3230',
        surface: '#faf6f0',
        'on-surface': '#2e3230',
        'surface-bright': '#faf6f0',
        'surface-dim': '#dbd7cf',
        'surface-tint': '#4a7c59',
        'surface-variant': '#e4e0d8',
        'on-surface-variant': '#4a4e4a',

        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f5f1ea',
        'surface-container': '#f0ece4',
        'surface-container-high': '#eae6de',
        'surface-container-highest': '#e4e0d8',

        outline: '#74796e',
        'outline-variant': '#c4c8bc',
        'inverse-surface': '#2e3230',
        'inverse-on-surface': '#f5f0e8',
        'inverse-primary': '#8ecf9e',
      },
      fontFamily: {
        headline: ['Literata', 'serif'],
        body: ['Nunito Sans', 'sans-serif'],
        label: ['Nunito Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        'terra': '0 4px 20px rgba(46, 50, 48, 0.06)',
        'terra-lg': '0 16px 40px rgba(46, 50, 48, 0.15)',
        'terra-sm': '0 2px 10px rgba(46, 50, 48, 0.02)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        nutriar: {
          "primary": "#4a7c59",
          "secondary": "#6b6358",
          "accent": "#705c30",
          "neutral": "#2e3230",
          "base-100": "#faf6f0",
          "info": "#4a7c59",
          "success": "#4a7c59",
          "warning": "#c4a66a",
          "error": "#b83230",
        },
      },
    ],
  },
};
