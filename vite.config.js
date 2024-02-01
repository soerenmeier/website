import { resolve, relative } from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import { usedSsrComponents } from 'fire-svelte/ssr/components.js';
import { plugin as mdPlugin } from 'vite-plugin-markdown';

// https://vitejs.dev/config/
export default defineConfig(({ outDir, mode, ssrBuild }) => {
	return {
		plugins: [
			svelte({
				compilerOptions: {
					hydratable: true
				},
				preprocess: [sveltePreprocess()]
			}),
			mdPlugin({ mode: 'html' }),
			usedSsrComponents(f => relative(__dirname, f))
		],
		resolve: {
			alias: [
				{ find: '@', replacement: resolve(__dirname, 'src') }
			]
		}
	};
});