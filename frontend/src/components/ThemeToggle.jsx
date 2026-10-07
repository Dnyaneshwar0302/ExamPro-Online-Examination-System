import React, { useEffect, useState } from 'react';
import './ThemeToggle.css';

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('exampro-theme') === 'dark';
  });

  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';

    document.documentElement.setAttribute(
      'data-theme',
      theme
    );

    localStorage.setItem('exampro-theme', theme);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((previous) => !previous);
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${
        darkMode ? 'dark-active' : ''
      }`}
      onClick={toggleTheme}
      title={
        darkMode
          ? 'Switch to Light Mode'
          : 'Switch to Dark Mode'
      }
      aria-label={
        darkMode
          ? 'Switch to Light Mode'
          : 'Switch to Dark Mode'
      }
    >
      <span className="theme-toggle-icon">
        {darkMode ? '☀' : '☾'}
      </span>

      <span className="theme-toggle-text">
        {darkMode ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}

export default ThemeToggle;