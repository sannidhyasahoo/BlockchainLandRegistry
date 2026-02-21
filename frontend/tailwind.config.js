/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    900: '#10002B',
                    800: '#240046',
                    700: '#3C096C',
                    600: '#5A189A',
                    500: '#7B2CBF',
                    400: '#9D4EDD',
                    300: '#C77DFF',
                    200: '#E0AAFF',
                    100: '#F5E6FF',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                calibri: ['Calibri', 'sans-serif'],
            },
            animation: {
                'carousel': 'scroll 60s linear infinite',
                'parallax': 'parallax 10s ease-in-out infinite alternate',
            },
            keyframes: {
                scroll: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(calc(-50% - 1rem))' },
                },
                parallax: {
                    '0%': { transform: 'translateY(-5%) rotate(0deg)' },
                    '100%': { transform: 'translateY(5%) rotate(1deg)' },
                }
            }
        },
    },
    plugins: [],
}
