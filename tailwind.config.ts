import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        safir: {
          bg: '#F6F3EC',          // Sıcak Keten / Yulaf (Ana zemin)
          surface: '#FFFFFF',     // Saf Beyaz
          muted: '#EFECE6',       // Yumuşak Kum / Taş Rengi
          sand: '#E6DFD5',        // Sıcak Kum
          border: '#E2DCD3',      // Sıcak Keten Çizgisi
          espresso: {
            DEFAULT: '#231B18',   // Derin Espresso (Ana kurumsal / tipografi)
            dark: '#1C1513',
            light: '#2C221E',     // Koyu Antrasit Kahve
          },
          navy: {
            DEFAULT: '#231B18',   // Derin Espresso'ya yönlendirildi (lacivert kaldırıldı)
            light: '#2C221E',
            dark: '#1C1513',
            50: '#F6F3EC',
            100: '#EFECE6',
          },
          terracotta: {
            DEFAULT: '#C85A32',   // Yanık Kiremit / Terracotta (Ana CTA)
            hover: '#B34E29',
            light: '#F8ECE6',
          },
          amber: {
            DEFAULT: '#C85A32',   // Terracotta'ya yönlendirildi (parlak turuncu kaldırıldı)
            hover: '#B34E29',
            light: '#F8ECE6',
            50: '#FAF2EC',
          },
          sage: {
            DEFAULT: '#5F6F52',   // Zeytin / Adaçayı Yeşili (İkincil / Rozet)
            light: '#EBF0E6',
            dark: '#4C5942',
          },
          emerald: {
            DEFAULT: '#5F6F52',   // Adaçayı yeşiline yönlendirildi (neon yeşil kaldırıldı)
            light: '#EBF0E6',
            dark: '#4C5942',
          },
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
