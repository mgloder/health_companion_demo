/** @type {import("tailwindcss").Config} */
export default {
  content: ["./client/index.html", "./client/**/*.{jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "sis-blue": {
          DEFAULT: "#3660F9",
          50: "#F9F9F9",
          100: "#EAECFA",
          300: "#EBEDFA",
          400: "#D2DFFF",
        },
        "sis-cyan": {
          50: "#F2F2F2B8",
          100: "#D8E4FF67",
          150: "#F6F6F696",
          200: "#D2DFFF",
        },
        "sis-gray": "#717070",
        "sis-purple": "#102A8A",
      },
      fontFamily: {
        sans: ["Alimama FangYuanTi VF", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
