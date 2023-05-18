import { resolve } from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import replace from '@rollup/plugin-replace';

// https://vitejs.dev/config/
export default defineConfig(({ outDir, mode, ssrBuild }) => {
	return {
		publicDir: ssrBuild ? false : 'public',
		base: '',
		build: {
			rollupOptions: {
				input: {
					main: resolve(__dirname, 'src/index.html')
				}
			}
		},
		ssr: {
			noExternal: 'fire'
		},
		plugins: [
			svelte({
				compilerOptions: {
					hydratable: true
				}
			}),
			replace({
				preventAssignment: true,
				'process.env.DEBUG': mode !== 'production'
			})
		],
		resolve: {
			alias: [
				{ find: '@', replacement: resolve(__dirname, 'src') }
			]
		}
	};
});