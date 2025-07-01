/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false, // Disable Tailwind's CSS reset to avoid conflicts with MUI
  },
  plugins: [],
};
