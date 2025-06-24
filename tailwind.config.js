/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilita el modo oscuro basado en la clase 'dark' en el elemento <html>
  content: [
    './src/**/*.{html,ts}', // Escanea todos los archivos HTML y TS en src
    './src/app/web/components/web-header/web-header.component.html', // Asegúrate de incluir el header
       // Esto asegura que Tailwind compile todas las variantes de color que usas.
    './src/app/web/components/location-map/location-map.component.ts',
    './src/app/web/components/location-map/location-map.component.html',
    './src/app/web/components/chatbot/chatbot.component.ts',
    './src/app/web/components/chatbot/chatbot.component.html',

    
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
       colors: {
        // Colores personalizados para el tema claro
        light: {
          'text-primary': '#1A202C', // Texto principal oscuro
          'text-secondary': '#4A5568', // Texto secundario un poco más claro
          'bg-primary': '#FFFFFF', // Fondo principal blanco
          'bg-secondary': '#F7FAFC', // Fondo secundario muy claro
          'accent': '#3182CE', // Azul para acentos
          'border': '#E2E8F0', // Borde claro
        },
        // Colores personalizados para el tema oscuro
        dark: {
          'text-primary': '#EDF2F7', // Texto principal claro
          'text-secondary': '#A0AEC0', // Texto secundario un poco más oscuro
          'bg-primary': '#1A202C', // Fondo principal oscuro
          'bg-secondary': '#2D3748', // Fondo secundario más oscuro
          'accent': '#63B3ED', // Azul claro para acentos
          'border': '#4A5568', // Borde oscuro
        },
        // Colores para tus primarios y secundarios si no quieres usar los personalizados directamente
        // Asegúrate de que estos coexistan o se reemplacen con tus 'light'/'dark' definidos
        primary: { // Podrías mapear estos a tus colores 'accent' o mantenerlos como una paleta aparte
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5', // Ejemplo, ajusta según tu branding
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        secondary: { // Ejemplo de colores secundarios
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Ejemplo, ajusta según tu branding
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#0f3d22',
        },
      },
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
        },
        // Nuevas animaciones para el componente About
        'text-reveal': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
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
                // Nuevas animaciones para el componente About
        'text-reveal': 'text-reveal 1s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.8s ease-out forwards',
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('flowbite/plugin') // Habilita el plugin de Flowbite
  ],
};