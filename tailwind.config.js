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
                    DEFAULT: '#22c55e', // Green 500
                    hover: '#16a34a',   // Green 600
                    light: 'rgba(34, 197, 94, 0.1)',
                    dark: '#14532d',    // Green 900
                },
                secondary: {
                    DEFAULT: '#64748b', // Slate 500
                    light: '#94a3b8',   // Slate 400
                    dark: '#334155',    // Slate 700
                },
                background: {
                    light: '#f6f7f8',
                    dark: '#022c22', // Green 950 (Emerald-ish)
                },
                surface: {
                    light: '#ffffff',
                    dark: '#14532d', // Green 900
                    darker: '#022c22', // Green 950
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
                'glow': '0 0 20px rgba(34, 197, 94, 0.25)',
                'glow-strong': '0 0 30px rgba(34, 197, 94, 0.4)',
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
