/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/index.html", "./client/**/*.{jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Alimama FangYuanTi VF', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
