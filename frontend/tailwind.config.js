/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F7F5",
        ink: "#14171F",
        "ink-muted": "#5B6472",
        highlighter: "#E0A400",
        hairline: "#E3E1DA",
        surface: "#FFFFFF",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.ink"),
            "--tw-prose-headings": theme("colors.ink"),
            "--tw-prose-links": theme("colors.ink"),
            "--tw-prose-bold": theme("colors.ink"),
            "--tw-prose-quotes": theme("colors.ink-muted"),
            a: {
              textDecoration: "underline",
              textDecorationColor: theme("colors.highlighter"),
              textDecorationThickness: "2px",
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};