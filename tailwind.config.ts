import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de luxo — inspiração Montblanc
        onix: {
          50:  '#F7F6F4',
          100: '#EDE9E3',
          200: '#D4CEC5',
          300: '#A8A09A',
          400: '#7A746E',
          500: '#4A4540',
          600: '#2E2B28',
          700: '#1A1818',
          800: '#0D0C0B',
        },
        ivoire: {
          50:  '#FEFEFC',
          100: '#FAFAF5',
          200: '#F5F3EE',
          300: '#EEE9E0',
          400: '#E5DDD0',
          500: '#D8CFC0',
        },
        ouro: {
          100: '#F8F0D8',
          200: '#EDD98A',
          300: '#D4AF4C',
          400: '#C9A84C',
          500: '#B8962E',
          600: '#9A7E1E',
        },
        // Mantidos para compatibilidade
        marrom: {
          50:  '#F5EDE8',
          100: '#E8D0C4',
          200: '#C4A08A',
          300: '#8B6348',
          400: '#5C3D2E',
          500: '#3D2B1F',
          600: '#2A1D14',
          700: '#1A110C',
        },
        creme: {
          50:  '#FDFAF4',
          100: '#FDF8F0',
          200: '#F5ECD8',
          300: '#E8D5B7',
          400: '#D4B896',
        },
        terracota: {
          100: '#F2D9C8',
          200: '#E5B49A',
          300: '#D4896A',
          400: '#C4713C',
          500: '#A85C2A',
          600: '#8B4A1F',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans:  ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.2em',
        widest3: '0.3em',
      },
      boxShadow: {
        luxo:       '0 2px 24px rgba(26, 24, 24, 0.08), 0 1px 4px rgba(26, 24, 24, 0.04)',
        'luxo-md':  '0 4px 32px rgba(26, 24, 24, 0.12), 0 2px 8px rgba(26, 24, 24, 0.06)',
        'luxo-lg':  '0 8px 48px rgba(26, 24, 24, 0.16), 0 4px 16px rgba(26, 24, 24, 0.08)',
        // legado
        caderno:       '8px 12px 32px rgba(26,24,24,0.12), 2px 4px 12px rgba(26,24,24,0.06)',
        'caderno-hover':'12px 16px 40px rgba(26,24,24,0.18), 4px 6px 16px rgba(26,24,24,0.10)',
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
