'use client';
/**
 * MoodMuse - Premium Landing Page
 * 
 * Simple elegant animation:
 * - Floating bubbles with music emotes
 * - Bubbles converge to center
 * - MoodMuse title reveals
 * - CTA button appears
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Lighter blue shade
const ACCENT_BLUE = '#4FC3F7';

// Emojis for the floating bubbles
const BUBBLE_EMOJIS = ['🎵', '💫', '🎶', '✨', '🎧', '💜', '🌙', '💖'];

export default function LandingPage() {
    const router = useRouter();
    const [phase, setPhase] = useState<'bubbles' | 'converge' | 'reveal' | 'slogan'>('bubbles');

    useEffect(() => {
        const convergeTimer = setTimeout(() => setPhase('converge'), 2000);
        const revealTimer = setTimeout(() => setPhase('reveal'), 3500);
        const sloganTimer = setTimeout(() => setPhase('slogan'), 4500);

        return () => {
            clearTimeout(convergeTimer);
            clearTimeout(revealTimer);
            clearTimeout(sloganTimer);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">

            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0a0a12] to-[#0f0f1a]" />

            {/* Subtle glow orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
                    style={{
                        background: `radial-gradient(circle, ${ACCENT_BLUE}40 0%, transparent 70%)`,
                        top: '20%',
                        left: '10%'
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-15"
                    style={{
                        background: `radial-gradient(circle, #ff6eb440 0%, transparent 70%)`,
                        bottom: '10%',
                        right: '15%'
                    }}
                />
            </div>

            {/* Floating Bubbles */}
            {(phase === 'bubbles' || phase === 'converge') && (
                <div className="absolute inset-0 pointer-events-none">
                    {BUBBLE_EMOJIS.map((emoji, i) => (
                        <div
                            key={i}
                            className={`absolute liquid-glass-bubble ${phase === 'converge' ? 'converging' : 'floating'}`}
                            style={{
                                '--delay': `${i * 0.1}s`,
                                '--start-x': `${20 + (i % 4) * 18}%`,
                                '--start-y': `${20 + Math.floor(i / 4) * 35}%`,
                            } as React.CSSProperties}
                        >
                            <span className="text-3xl neon-blue-emoji">{emoji}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 text-center px-6">

                {/* Title Reveal */}
                <div className={`transition-all duration-1000 ease-out transform
                    ${phase === 'reveal' || phase === 'slogan'
                        ? 'scale-100 opacity-100'
                        : 'scale-0 opacity-0'}`}>
                    <h1
                        className="mb-6 animate-bounce-subtle"
                        style={{
                            fontFamily: 'Pacifico, cursive',
                            fontSize: 'clamp(2.75rem, 7vw, 4.5rem)',
                            letterSpacing: '0.02em',
                            background: 'linear-gradient(135deg, #00BFFF 0%, #4FC3F7 40%, #87CEEB 70%, #ffffff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        🎵oodMuse
                    </h1>
                </div>

                {/* Slogan + CTA */}
                <div className={`transition-all duration-1000 delay-200
                    ${phase === 'slogan' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                    <p className="text-xl font-light tracking-wide mb-2" style={{ color: ACCENT_BLUE }}>
                        Music that understands how you feel
                    </p>

                    <p className="text-sm mb-10" style={{ color: `${ACCENT_BLUE}80` }}>
                        Creating your perfect playlist...
                    </p>

                    {/* Liquid Glass CTA Button */}
                    <button
                        onClick={() => router.push('/mood')}
                        className="liquid-glass-cta group"
                    >
                        <span className="relative text-base font-medium flex items-center gap-2" style={{ color: ACCENT_BLUE }}>
                            Start Listening
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>

            {/* CSS for animations */}
            <style jsx global>{`
                /* Liquid Glass Bubble */
                .liquid-glass-bubble {
                    width: 70px;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: linear-gradient(135deg,
                        rgba(79, 195, 247, 0.08) 0%,
                        rgba(79, 195, 247, 0.03) 50%,
                        rgba(79, 195, 247, 0.01) 100%);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(79, 195, 247, 0.2);
                    box-shadow:
                        inset 0 1px 0 rgba(255, 255, 255, 0.15),
                        0 8px 32px rgba(0, 0, 0, 0.2);
                    left: var(--start-x);
                    top: var(--start-y);
                }

                .liquid-glass-bubble.floating {
                    animation: float-slow 4s ease-in-out infinite;
                    animation-delay: var(--delay);
                }

                .liquid-glass-bubble.converging {
                    animation: converge-to-center 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    animation-delay: var(--delay);
                }

                /* Liquid Glass CTA */
                .liquid-glass-cta {
                    position: relative;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 50px;
                    cursor: pointer;
                    background: linear-gradient(135deg,
                        rgba(79, 195, 247, 0.1) 0%,
                        rgba(79, 195, 247, 0.05) 50%,
                        rgba(79, 195, 247, 0.02) 100%);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1.5px solid rgba(79, 195, 247, 0.35);
                    box-shadow:
                        inset 0 1px 0 rgba(255, 255, 255, 0.1),
                        0 8px 32px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                }

                .liquid-glass-cta:hover {
                    transform: translateY(-2px);
                    border-color: rgba(79, 195, 247, 0.4);
                    box-shadow:
                        inset 0 1px 0 rgba(255, 255, 255, 0.15),
                        0 12px 40px rgba(79, 195, 247, 0.2);
                }

                @keyframes float-slow {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-15px) rotate(5deg); }
                    50% { transform: translateY(-25px) rotate(0deg); }
                    75% { transform: translateY(-10px) rotate(-5deg); }
                }

                @keyframes converge-to-center {
                    0% { opacity: 1; }
                    80% {
                        opacity: 1;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                    100% {
                        opacity: 0;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%) scale(0);
                    }
                }

                .animate-bounce-subtle {
                    animation: bounce-subtle 2s ease-in-out infinite;
                }

                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }

                /* Neon Blue Emoji - removes original colors, applies blue tint */
                .neon-blue-emoji {
                    filter: grayscale(100%) brightness(1.5) sepia(100%) hue-rotate(180deg) saturate(5);
                    opacity: 0.9;
                }
            `}</style>
        </div>
    );
}
