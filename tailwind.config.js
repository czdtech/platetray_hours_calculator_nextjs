import typography from '@tailwindcss/typography';
import { PLANET_COLOR_HEX } from './src/constants/planetColors.shared.js';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 启用基于 class 的暗色模式，配合 next-themes 使用
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // 行星主题色：统一从共享配置中读取，确保与 TS 常量保持一致
        'planet-sun': PLANET_COLOR_HEX.Sun,       // amber-800
        'planet-moon': PLANET_COLOR_HEX.Moon,     // indigo-500
        'planet-mercury': PLANET_COLOR_HEX.Mercury, // sky-500
        'planet-venus': PLANET_COLOR_HEX.Venus,   // pink-800
        'planet-mars': PLANET_COLOR_HEX.Mars,     // red-600
        'planet-jupiter': PLANET_COLOR_HEX.Jupiter, // purple-600
        'planet-saturn': PLANET_COLOR_HEX.Saturn, // gray-500
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
            maxWidth: 'none',
            h1: {
              color: theme('colors.gray.900'),
              fontWeight: '800',
              fontSize: '2.25em',
              marginTop: '0',
              marginBottom: '0.8em',
              lineHeight: '1.2',
            },
            h2: {
              color: theme('colors.gray.900'),
              fontWeight: '700',
              fontSize: '1.75em',
              marginTop: '1.75em',
              marginBottom: '0.5em',
              lineHeight: '1.3',
            },
            h3: {
              color: theme('colors.gray.900'),
              fontWeight: '600',
              fontSize: '1.375em',
              marginTop: '1.5em',
              marginBottom: '0.5em',
              lineHeight: '1.3',
            },
            p: {
              fontSize: '1.075rem',
              lineHeight: '1.75',
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            a: {
              color: theme('colors.purple.600'),
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            li: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            ul: {
              listStyleType: 'none',
              paddingLeft: '0',
            },
            ol: {
              listStyleType: 'decimal',
              paddingLeft: '1.5em',
            },
            'ul > li': {
              position: 'relative',
              paddingLeft: '1.75em',
              '&:before': {
                content: '""',
                width: '0.6em',
                height: '0.6em',
                position: 'absolute',
                backgroundColor: theme('colors.purple.500'),
                borderRadius: '50%',
                left: 0,
                top: '0.5em',
              },
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              borderLeftWidth: '0.25rem',
              borderLeftColor: theme('colors.purple.500'),
              paddingLeft: '1rem',
              marginLeft: '0',
              marginRight: '0',
              color: theme('colors.gray.700'),
            },
            img: {
              borderRadius: '0.375rem',
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            code: {
              color: theme('colors.purple.700'),
              fontWeight: '600',
              backgroundColor: theme('colors.gray.100'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
            },
            pre: {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.gray.100'),
              borderRadius: '0.5rem',
              padding: '1rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              overflowX: 'auto',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            h1: {
              color: theme('colors.gray.100'),
            },
            h2: {
              color: theme('colors.gray.100'),
            },
            h3: {
              color: theme('colors.gray.100'),
            },
            a: {
              color: theme('colors.purple.400'),
            },
            blockquote: {
              color: theme('colors.gray.400'),
              borderLeftColor: theme('colors.purple.500'),
            },
            code: {
              color: theme('colors.purple.400'),
              backgroundColor: theme('colors.gray.800'),
            },
            ul: {
              listStyleType: 'none',
              paddingLeft: '0',
            },
            ol: {
              listStyleType: 'decimal',
              paddingLeft: '1.5em',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
