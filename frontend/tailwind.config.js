// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        simple: ["Arial", "Helvetica", "ui-sans-serif", "sans-serif"], // simple clean font
      },
    },
  },
  plugins: [],
};