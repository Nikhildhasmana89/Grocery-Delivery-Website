"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  mounted: false,
});

export const UserThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Always initialize to "dark" on both server and initial client render to guarantee 100% hydration match
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("freshkart-theme") as Theme | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("freshkart-theme", nextTheme);
      }
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      <div
        className={
          theme === "light"
            ? "user-light-mode bg-white text-slate-900 min-h-screen transition-colors duration-300 font-sans"
            : "user-dark-mode bg-slate-950 text-slate-100 min-h-screen transition-colors duration-300 font-sans"
        }
        style={{
          backgroundColor: theme === "light" ? "#ffffff" : "#020617",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useUserTheme = () => useContext(ThemeContext);
