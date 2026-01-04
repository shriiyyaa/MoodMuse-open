/**
 * MoodMuse - Theme Toggle
 * 
 * Sun/Moon toggle for switching modes.
 */

'use client';

import { useTheme } from '@/providers/ThemeProvider';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-3.5 rounded-full glass-subtle hover:bg-white/10 transition-all 
                     hover:text-accent border-transparent hover:border-accent/30 group"
            aria-label="Toggle theme"
        >
            <div className="relative w-7 h-7">
                {/* Sun Icon (Show when Dark) - Wait, logic reversed for icon showing target state */}
                {/* Actually let's show current state icon or target? usually target. */}
                {theme === 'dark' ? (
                    // Sun Icon
                    <svg
                        className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>
                ) : (
                    // Moon Icon
                    <svg
                        className="w-6 h-6 text-accent group-hover:-rotate-12 transition-transform duration-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                    </svg>
                )}
            </div>
        </button>
    );
}
