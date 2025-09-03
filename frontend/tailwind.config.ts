import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        schoolbell: ["Schoolbell", "Schoolbell Fallback", "sans-serif"],
      },
      colors: {
        primary: "#4f46e5",
      },
    },
  },
  plugins: [],
} satisfies Config;
