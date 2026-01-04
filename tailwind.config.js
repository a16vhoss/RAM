/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'media', // or 'class'
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                'primary-hover': 'var(--primary-hover)',
                'background-dark': 'var(--background-dark)',
                'surface-dark': 'var(--surface-dark)',
                success: 'var(--success)',
                error: 'var(--error)',
            },
            fontFamily: {
                display: ['var(--font-spline)', 'sans-serif'],
                body: ['var(--font-noto)', 'sans-serif'],
            },
            borderRadius: {
                xl: 'var(--radius-xl)',
                '2xl': 'var(--radius-2xl)',
            },
            boxShadow: {
                glow: 'var(--shadow-glow)',
            },
        },
    },
    plugins: [],
}
