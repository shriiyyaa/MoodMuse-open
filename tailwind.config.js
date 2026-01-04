/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            // MoodMuse custom color palette
            colors: {
                // Primary gradient colors for emotional depth
                mood: {
                    soft: '#F8F0FF',      // Light lavender background
                    primary: '#8B5CF6',   // Vibrant purple
                    deep: '#4C1D95',      // Deep purple
                    warm: '#F59E0B',      // Warm amber for hope
                    cool: '#3B82F6',      // Cool blue for calm
                },
                // Neutral tones for text and UI
                surface: {
                    dark: '#0F0F1A',      // Near-black with purple tint
                    card: '#1A1A2E',      // Card backgrounds
                    hover: '#252540',     // Hover states
                }
            },
            // Custom animations for mood transitions
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    'from': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
                    'to': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
                }
            },
            // Typography
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
