"use client";

import { useTheme } from "../utils/useTheme";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md hover:scale-110 transition-transform duration-300"
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? <Sun size={20} className="transition-opacity duration-300" /> : <Moon size={20} className="transition-opacity duration-300" />}
    </button>
  );
};

export default ThemeToggle;
