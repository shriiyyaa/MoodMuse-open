/**
 * MoodMuse - Custom Theme Provider
 * 
 * Manages light/dark mode without external dependencies.
 * Persists to localStorage and applies class to <html>.
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Get stored theme or default to dark
        const stored = localStorage.getItem('theme') as Theme;
        if (stored) {
            setTheme(stored);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme, mounted]);

    function toggleTheme() {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }

    // Prevent hydration mismatch by rendering nothing until mounted
    // OR render children but with default theme to avoid flicker
    // FIX: Always provide context so children (ThemeToggle) don't crash
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        // Fallback for non-provider usage, or throw
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
