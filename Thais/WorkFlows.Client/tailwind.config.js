/** @type {import('tailwindcss').Config} */
export default {
  // Le variant « dark: » s'applique avec la classe .dark ET avec le thème Sombre de THAIS (posé via l'attribut
  // data-theme='sombre' sur <html>, sans classe .dark) : sinon les couleurs claires « dark:text-emerald-400 »,
  // etc. ne s'activaient jamais dans ce thème.
  darkMode: ['variant', ['&:is(.dark *)', "html[data-theme='sombre'] &"]],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
        },
        fallback: {
          DEFAULT: 'hsl(var(--fallback))',
          foreground: 'hsl(var(--fallback-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        config: {
          DEFAULT: 'hsl(var(--card-configuration))',
          foreground: 'hsl(var(--card-configuration-foreground))',
        },
        title: {
          DEFAULT: 'hsl(var(--title))',
          foreground: 'hsl(var(--title-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        stat: {
          DEFAULT: 'hsl(var(--stat))',
          foreground: 'hsl(var(--stat-foreground))',
        },
        'priority-1': {
          DEFAULT: 'hsl(var(--priority-1))',
          foreground: 'hsl(var(--priority-1-foreground))',
        },
        'priority-2': {
          DEFAULT: 'hsl(var(--priority-2))',
          foreground: 'hsl(var(--priority-2-foreground))',
        },
        'priority-3': {
          DEFAULT: 'hsl(var(--priority-3))',
          foreground: 'hsl(var(--priority-3-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        rndd: ['var(--font-rndd)'],
        ecclesiasti: ['var(--font-ecclesiasti)'],
        ecrabbini: ['var(--font-ecrabbini)'],
        regulard: ['var(--font-regulard)'],
        semifold: ['var(--font-semifold)'],
      },
      fontSize: {
        display: ['60px', '72px'],
        'display-sm': ['48px', '58px'],
        h1: ['34px', '40px'],
        h2: ['24px', '32px'],
        h3: ['18px', '32px'],
        body: ['16px', '24px'],
        'body-sm': ['14px', '24px'],
        caption: ['12px', '16px'],
        retroimage: ['16px', '24px'],
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
