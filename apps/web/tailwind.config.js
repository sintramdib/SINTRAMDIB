/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    // Desativa o reset global do Tailwind para não alterar o visual da dashboard (que usa CSS próprio).
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          // Referenciados por variáveis CSS para que o tema dinâmico atue globalmente.
          // Os defaults (:root) preservam a paleta original.
          blue: 'var(--brand-blue)',
          blueDark: 'var(--brand-blueDark)',
          yellow: 'var(--brand-yellow)',
          yellowDark: 'var(--brand-yellowDark)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};