/** @type {import('tailwindcss').Config} */  
module.exports = {  
  // Specify the paths to all of your template files  
  content: [  
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust as necessary for your project  
  ],  
  theme: {  
    extend: {  
      // Extend the default theme here  
      colors: {  
        primary: '#1D4ED8', // Customized primary color  
        secondary: '#FBBF24', // Customized secondary color  
      },  
      spacing: {  
        '128': '32rem', // Add custom spacing  
      },  
      fontFamily: {  
        sans: ['Helvetica', 'Arial', 'sans-serif'], // Custom font family  
      },  
    },  
  },  
  plugins: [],  
};