module.exports = {
  safelist: [
    {
      pattern: /aspect-./,
    },
    {
      pattern: /grid-cols-./,
    },
  ],
  theme: {
    extend: {
      colors: {
        // Primary: cream / light yellow (star)
        star: {
          50: "#fffaf0",
          100: "#fff1d6",
          200: "#ffe7b8",
          300: "#ffd993",
          400: "#ffcc66",
          500: "#dbb570",
          600: "#c89a45",
          700: "#b08b46",
          800: "#8f6c38",
          900: "#6f4f28",
        },
        // Secondary: triad (blue-ish)
        ocean: {
          50: "#f0f8ff",
          100: "#dfeeff",
          200: "#bfd9ff",
          300: "#99c2ff",
          400: "#66a8ff",
          500: "#4d8ff0",
          600: "#346fd1",
          700: "#2a548f",
          800: "#1f3b5f",
          900: "#16283c",
        },
      },
      backgroundColor: {
        page: "var(--bg-page, #fffaf0)",
      },
      borderColor: {
        DEFAULT: "var(--border-color, #4d8ff0)",
      },
    },
  },
  plugins: [],
};
