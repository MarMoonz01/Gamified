/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#050505',
                'background-end': '#0a0a12',
                system: '#00f3ff',
                danger: '#ff003c',
                success: '#bc13fe',
            },
            fontFamily: {
                header: ['Rajdhani', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
