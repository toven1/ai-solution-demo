import type { Config } from "tailwindcss";

// 디자인원칙.md의 "화이트 블루" 플랫 라이트 토큰만 사용한다.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./server/**/*.{ts,tsx}"
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      black: "#000000",
      bg: "#ffffff",
      bgSoft: "#f7f7f8",
      surface: "#f6f6f7",
      surfaceStrong: "#ececee",
      border: "#e4e4e7",
      borderStrong: "#cdcdd3",
      text: "#18181b",
      textSub: "#55555e",
      textFaint: "#9a9aa3",
      accent: "#2563eb",
      accentSoft: "rgba(37,99,235,0.10)",
      accentStrong: "#1e40af",
      accentHover: "#1d4ed8",
      card: "#ffffff",
      cardBorder: "#e4e4e7",
      onAccent: "#ffffff",
      success: "#1a7f37",
      warning: "#9a6700",
      danger: "#cf222e"
    },
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "sans-serif"
        ]
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "12px"
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,0.08)",
        mock: "0 18px 48px rgba(15,23,42,0.14)"
      }
    }
  },
  plugins: []
};

export default config;
