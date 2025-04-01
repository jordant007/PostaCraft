// tailwind.config.js
module.exports = {
    content: [
      './src/app/**/*.{js,ts,jsx,tsx}', // Updated for App Router
      './src/components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: '#6B46C1', // Vibrant purple
          secondary: '#F687B3', // Elegant pink
          accent: '#F6E05E', // Sleek yellow
        },
      },
    },
    plugins: [],
  };