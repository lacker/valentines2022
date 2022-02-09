module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    colors: {
      yellow: "#c9b458",
      green: "#6aaa64",
      grey: "#787c7e",
      white: "#ffffff"
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
