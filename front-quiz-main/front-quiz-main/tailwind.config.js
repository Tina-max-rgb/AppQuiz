/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        success: '#16a34a',
        danger: '#ef4444',
        surface: '#ffffff',
        muted: '#6b7280'
      },
      boxShadow: {
        soft: "0 6px 30px rgba(30,41,59,0.07)",
        inset: "inset 0 -1px 0 rgba(0,0,0,0.03)"
      },
      borderRadius: {
        xl2: "1rem"
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    },
  },
  plugins: [],
}
