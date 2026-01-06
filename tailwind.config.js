/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'media',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2791e7', // Original RAM Primary
                    hover: '#1e70b3',
                    light: 'rgba(39, 145, 231, 0.1)',
                    dark: '#144a75',
                },
                secondary: {
                    DEFAULT: '#64748b', // Slate 500
                    light: '#94a3b8',   // Slate 400
                    dark: '#334155',    // Slate 700
                },
                background: {
                    light: '#f6f7f8',
                    dark: '#0f172a', // Slate 900 - Richer dark
                },
                surface: {
                    light: '#ffffff',
                    dark: '#1e293b', // Slate 800
                    darker: '#0f172a', // Slate 900
                },
                success: '#10b981', // Emerald 500
                error: '#ef4444',   // Red 500
                warning: '#f59e0b', // Amber 500
                info: '#3b82f6',    // Blue 500
                // Text colors
                text: {
                    main: { DEFAULT: '#111a21', dark: '#f8fafc' }, // Slate 900 / Slate 50
                    secondary: { DEFAULT: '#64748b', dark: '#94a3b8' }, // Slate 500 / Slate 400
                }
            },
            fontFamily: {
                display: ['var(--font-spline)', 'sans-serif'],
                body: ['var(--font-noto)', 'sans-serif'],
            },
            borderRadius: {
                xl: '16px',
                '2xl': '24px',
                '3xl': '32px',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(39, 145, 231, 0.25)',
                'glow-strong': '0 0 30px rgba(39, 145, 231, 0.4)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
