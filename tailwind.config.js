/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {

      fontFamily: {
        mono: ["Anonymous Pro", "monospace"]
      },

      colors: {
        input: "hsl(var(--input))",
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
        // Border colors
        border: {
          DEFAULT: "hsl(var(--border))",
          hover: "#98ff99"
        },
        // Base colors for components
        primary: {
          DEFAULT: "#98ff99",
          button: "#98ff99",
          text: "#b9c5e5",
          bg: "#333333",
          card: "#121221",
          hover: "#7acc7a"
        },
        // Link color
        link: "#7888B0",
        // Text colors
        text: {
          DEFAULT: "#b9c5e5",
          primary: "#b9c5e5"
        },
        // Background colors
        bg: {
          DEFAULT: "#333333",
          card: "#121221e6",
          topic: "#121221"
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

