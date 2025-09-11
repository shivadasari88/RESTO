module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9', // Your main accent color
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        // Add other colors as needed
      }
    }
  }
}

