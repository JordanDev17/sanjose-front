/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilita el modo oscuro basado en la clase 'dark' en el elemento <html>
  content: [
    './src/**/*.{html,ts}', // Escanea todos los archivos HTML y TS en src
    './src/app/web/components/web-header/web-header.component.html', // Asegúrate de incluir el header
       // Esto asegura que Tailwind compile todas las variantes de color que usas.
    './src/app/web/components/location-map/location-map.component.ts',
    './src/app/web/components/location-map/location-map.component.html',
    "./node_modules/flowbite/**/*.js" // Incluye los archivos JS de Flowbite para sus clases de utilidad
  ],
    safelist: [ // Opcional, pero más robusto para clases dinámicas
    {
      pattern: /bg-(blue|green|yellow|red|teal|purple|gray)-(100|200|500|700|800|900)/,
      variants: ['hover', 'dark'],
    },
    {
      pattern: /border-(blue|green|yellow|red|teal|purple|gray)-500/,
    },
        {
      pattern: /text-(xl|lg)/,
    }
  ],
  theme: {
    extend: {
      // Definición de keyframes personalizados para animaciones
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-8px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(8px)' },
        },
        scaleIn: {
          'from': { transform: 'scale(0)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        bounce: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-15px)' },
          '60%': { transform: 'translateY(-7px)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.98)', opacity: '0.8' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        fadeOutOverlay: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '0' },
        },
        // Nueva animación para la entrada del header
        slideInFromTop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // Animación de brillo para el botón de tema
        'button-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 128, 255, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 128, 255, 0.8)' },
        }
      },
      // Mapea los keyframes a utilidades de animación
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'shake': 'shake 0.6s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'bounce': 'bounce 1s ease-in-out',
        'pulse': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'confetti-fall': 'confetti-fall var(--duration) ease-out forwards',
        'theme-transition-overlay': 'fadeOutOverlay 0.6s forwards',
        'slide-in-from-top': 'slideInFromTop 0.7s ease-out forwards', // Aplica la nueva animación
        'button-glow': 'button-glow 1.5s infinite alternate', // Animación de brillo
      },
    },
  },
  plugins: [
    require('flowbite/plugin') // Habilita el plugin de Flowbite
  ],
};