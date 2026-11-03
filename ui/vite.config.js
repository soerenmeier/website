import { resolve, relative } from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import { plugin as mdPlugin } from 'vite-plugin-markdown';

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => {
	return {
		publicDir: isSsrBuild ? false : undefined,
		ssr: {
			noExternal: isSsrBuild ? true : ['chuchi'],
		},
		server: {
			fs: {
				allow: ['..'],
			},
		},
		plugins: [
			svelte({
				compilerOptions: {
					runes: true,
				},
				preprocess: [sveltePreprocess()],
			}),
			mdPlugin({ mode: 'html' }),
			usedSsrComponents(f => relative(__dirname, f)),
		],
		resolve: {
			alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
		},
	};
});

// Records every component rendered during ssr in the 'modules' context
// (chuchi/ssr SsrComponents), so the server can add the css and js preloads
// from the ssr manifest. chuchi's usedSsrComponents only knows the svelte 4
// output, so this matches the svelte 5 server function instead
// (`function Name($$renderer, $$props) {`, `$$payload` before svelte 5.39).
const SSR_COMPONENT_FN =
	/^(?:export default )?function [\w$]+\(\$\$(?:renderer|payload)\b[^)]*\)\s*\{/m;

function usedSsrComponents(relativeFn) {
	return {
		name: 'used-ssr-components',
		enforce: 'post',
		transform(code, id, options) {
			if (!options?.ssr || !id.endsWith('.svelte')) return;

			const match = SSR_COMPONENT_FN.exec(code);
			if (!match) {
				// without tracking the page loses its css on first load,
				// so fail loudly instead of shipping a broken build
				this.error(`could not inject ssr modules tracking in ${id}`);
			}
			const idx = match.index + match[0].length;

			const file = JSON.stringify(relativeFn(id));

			return `import { getContext as __modulesGetContext } from 'svelte';
${code.slice(0, idx)}
{
	const ctx = __modulesGetContext('modules');
	if (ctx instanceof Set) ctx.add(${file});
}
${code.slice(idx)}`;
		},
	};
}
