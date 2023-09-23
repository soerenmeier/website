import { resolve, relative } from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { usedSsrComponents } from 'fire-svelte/ssr/components.js';

// https://vitejs.dev/config/
export default defineConfig(({ outDir, mode, ssrBuild }) => {
	return {
		plugins: [
			svelte({
				compilerOptions: {
					hydratable: true
				}
			}),
			usedSsrComponents(f => relative(__dirname, f))
		],
		resolve: {
			alias: [
				{ find: '@', replacement: resolve(__dirname, 'src') }
			]
		}
	};
});