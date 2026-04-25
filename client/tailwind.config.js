/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blush:    "#F9DDE3",
        mint:     "#DDF3E5",
        cream:    "#fdf8f4",
        lavender: "#EEE9FF",
        ink:      "#3A2F35",
        brown: {
          DEFAULT: "#8B5E3C",
          dark:    "#3b1f0e",
          light:   "#c49a6c",
          pale:    "#f5ede3",
        }
      },
      boxShadow: {
        soft:   "0 4px 24px rgba(59,31,14,0.08)",
        medium: "0 8px 32px rgba(59,31,14,0.12)",
        card:   "0 2px 12px rgba(59,31,14,0.06)",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body:    ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      }
    }
  },
  plugins: []
};
