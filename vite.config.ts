import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vitest/config';
import mkcert from 'vite-plugin-mkcert';
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		mkcert(),
		crossOriginIsolation(),
		enhancedImages(),
		sveltekit(),
		Icons({
			compiler: 'svelte'
		})
	],
	server: {
		proxy: {}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
