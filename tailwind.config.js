/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        code: ["Monolisa", "monospace"],
        mono: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji"]
      },
      colors: {
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        primary: {
          DEFAULT: "#98ff99",
          button: {
            DEFAULT: "#98ff99",
            hover: "#7acc7a"
          },
          text: "#b9c5e5",
          bg: "#333333",
          card: "#121221"
        },
        button: {
          DEFAULT: "#98ff99",
          primary: "#98ff99",
          hover: "#7acc7a",
          active: "#5fa35f",
          disabled: "#c7eac7",
          secondary: "#6bff6d",
          secondaryHover: "rgb(119, 248, 120)",
          outline: "#98ff99",
          outlineHover: "#7acc7a",
          ghost: "transparent",
          ghostHover: "#2a2a2a"
        },
        text: {
          primary: "#b9c5e5",
          secondary: "#d0d7f2",
          muted: "#8995b0",
          error: "#ff6b6b",
          warning: "#ffcc66",
          success: "rgb(11, 198, 74)",
          info: "#66ccff",
          placeholder: "#777a8b",
          link: "#66ccff",
          linkHover: "#5599cc",
          difficultEasy: "rgb(74, 222, 128)",
          difficultMedium: "rgb(234, 179, 8)",
          difficultHard: "rgb(239, 68, 68)"
        },
        bg: {
          primary: "#333333",
          secondary: "#1e1e1e",
          muted: "#252525",
          card: "#121221",
          error: "#441111",
          warning: "#664411",
          success: "#114411",
          info: "#113355",
          gradientStart: "#98ff99",
          gradientEnd: "#7acc7a"
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          primary: "#98ff99",
          secondary: "#7acc7a",
          muted: "#444444",
          error: "#ff6b6b",
          warning: "#ffcc66",
          success: "#66ff99",
          info: "#66ccff"
        },
        shadow: {
          soft: "rgba(0, 0, 0, 0.1)",
          medium: "rgba(0, 0, 0, 0.2)",
          strong: "rgba(0, 0, 0, 0.4)",
          primary: "rgba(152, 255, 153, 0.4)",
          secondary: "rgba(185, 197, 229, 0.4)"
        },
        input: {
          DEFAULT: "hsl(var(--input))",
          border: "#444444",
          borderFocus: "#98ff99",
          bg: "#222222",
          bgDisabled: "#1a1a1a",
          text: "#b9c5e5",
          placeholder: "#777a8b",
          focusRing: "#7acc7a"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  },
  // eslint-disable-next-line no-undef
  plugins: [require("tailwindcss-animate")]
}

