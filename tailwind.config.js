/** @type {import("tailwindcss").Config} */
export default {
  content: ["./client/index.html", "./client/**/*.{jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        'sis-ripple': 'ripple 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'blink-1': 'blink 1.5s infinite',
        'blink-2': 'blink 1.5s infinite 0.5s',
        'blink-3': 'blink 1.5s infinite 1s',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(2)', opacity: 0 },
        },
        blink: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '1' },
        },
      },
      colors: {
        "sis-black": {
          400: "#333333",
        },
        "sis-blue": {
          DEFAULT: "#3660F9",
          50: "#F9F9F9",
          100: "#EAECFA",
          300: "#EBEDFA",
          400: "#D2DFFF",
        },
        "sis-cyan": {
          50: "#F2F2F2B8",
          60: "#F2F2F2",
          100: "#D8E4FF67",
          110: "#F0F0F066",
          150: "#F6F6F696",
          200: "#D2DFFF",
        },
        "sis-gray": {
          DEFAULT: "#717070",
          100: "#C7C7C7"
        },
        "sis-purple": "#102A8A",
      },
      fontFamily: {
        sans: ["Alimama FangYuanTi VF", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
