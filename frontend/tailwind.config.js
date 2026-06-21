/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Existing editorial tokens - kept, available if needed
        paper: "#F6F7F5",
        ink: "#14171F",
        "ink-muted": "#5B6472",
        highlighter: "#E0A400",
        hairline: "#E3E1DA",
        surface: "#FFFFFF",

        // New dark-mode premium system
        bg: "#0B0D12",
        surface2: "#111827",
        card: "#171F2F",
        primary: "#7C3AED",
        secondary: "#22D3EE",
        accent: "#F472B6",
        text: "#F8FAFC",
        muted: "#94A3B8",
        success: "#22C55E",
        border: "#1F2937",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter Tight", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm2: "12px",
        md2: "20px",
        lg2: "32px",
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
        dark: {
          css: {
            "--tw-prose-body": theme("colors.text"),
            "--tw-prose-headings": theme("colors.text"),
            "--tw-prose-links": theme("colors.secondary"),
            "--tw-prose-bold": theme("colors.text"),
            "--tw-prose-quotes": theme("colors.muted"),
            "--tw-prose-quote-borders": theme("colors.primary"),
            "--tw-prose-code": theme("colors.secondary"),
            "--tw-prose-pre-bg": theme("colors.card"),
            "--tw-prose-pre-code": theme("colors.text"),
            "--tw-prose-hr": theme("colors.border"),
            blockquote: {
              fontStyle: "normal",
              borderLeftWidth: "3px",
            },
            code: {
              backgroundColor: theme("colors.card"),
              padding: "0.2em 0.4em",
              borderRadius: "6px",
              fontWeight: "500",
            },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};