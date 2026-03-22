/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			fontFamily: {
				sans: ['DM Sans', 'sans-serif'],
				serif: ['Cormorant Garamond', 'serif'],
			},
			colors: {
				bronze: '#8B7355',
				gold: '#D4AF37',
				black: '#000000',
				white: '#FFFFFF',
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: '#000000',
				foreground: '#FFFFFF',
				primary: {
					DEFAULT: '#D4AF37',
					foreground: '#000000',
				},
				secondary: {
					DEFAULT: '#8B7355',
					foreground: '#FFFFFF',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: '#1A1A1A',
					foreground: '#A1A1AA',
				},
				accent: {
					DEFAULT: '#1A1A1A',
					foreground: '#D4AF37',
				},
				popover: {
					DEFAULT: '#0A0A0A',
					foreground: '#FFFFFF',
				},
				card: {
					DEFAULT: '#0A0A0A',
					foreground: '#FFFFFF',
				},
			},
			boxShadow: {
				'glow-gold': '0 0 20px rgba(212, 175, 55, 0.3)',
				'shadow-bronze': '0 4px 12px rgba(139, 115, 85, 0.2)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				// Animations luxe Philia'Store
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
					'50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'fade-in-down': {
					'0%': { opacity: '0', transform: 'translateY(-20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
				'slide-in-left': {
					'0%': { opacity: '0', transform: 'translateX(-20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
				'border-glow': {
					'0%, 100%': { borderColor: 'rgba(212, 175, 55, 0.3)' },
					'50%': { borderColor: 'rgba(212, 175, 55, 0.8)' },
				},
				'text-shimmer': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' },
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// Animations luxe Philia'Store
				'shimmer': 'shimmer 2s linear infinite',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
				'fade-in-down': 'fade-in-down 0.5s ease-out forwards',
				'scale-in': 'scale-in 0.3s ease-out forwards',
				'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
				'slide-in-left': 'slide-in-left 0.4s ease-out forwards',
				'border-glow': 'border-glow 2s ease-in-out infinite',
				'text-shimmer': 'text-shimmer 3s ease-in-out infinite',
				'spin-slow': 'spin-slow 8s linear infinite',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};