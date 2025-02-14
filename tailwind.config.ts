/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
      './pages/**/*.{ts,tsx}',
      './components/**/*.{ts,tsx}',
      './app/**/*.{ts,tsx}',
      './src/**/*.{ts,tsx}',
      ],
    theme: {
    	extend: {
    		colors: {
    			text: 'var(--color-text)',
    			bg: 'var(--color-bg)',
    			link: 'var(--color-link)',
    			'link-hover': 'var(--color-link-hover)',
    			info: 'var(--color-info)',
    			primary: 'var(--primary)',
    			'primary-foreground': 'var(--primary-foreground)',
    			secondary: 'var(--secondary)',
    			'secondary-foreground': 'var(--secondary-foreground)',
    			accent: 'var(--accent)',
    			'accent-foreground': 'var(--accent-foreground)',
    			muted: 'var(--muted)',
    			'muted-foreground': 'var(--muted-foreground)',
    			border: 'var(--border)',
    			background: 'var(--background)',
    			foreground: 'var(--foreground)'
    		},
    		fontFamily: {
    			retro: [
    				'Audiowide',
    				'cursive'
    			]
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: 0
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: 0
    				}
    			},
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
  }
  
  