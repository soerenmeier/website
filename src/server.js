import App from './app.svelte';
import Router from 'fire-svelte/routing/router.js';
import Request from 'fire-svelte/routing/request.js';
import SsrCache from 'fire-svelte/ssr/cache.js';
import SsrComponents from 'fire-svelte/ssr/components.js';
import * as routes from './pages/routes.js';
import { handleRoute } from './main.js';

// opt: { method, uri, ?ssrManifest }
// returns: { status, body, head }
export async function render(opt) {
	const cache = new SsrCache;
	const router = new Router;

	routes.register(router);

	const req = new Request(opt.uri);

	const route = router.route(req);
	const { status, props } = await handleRoute(route);

	const ssrComponents = new SsrComponents;
	const context = new Map;
	context.set('router', router);
	ssrComponents.addToContext(context);

	let { html, head } = App.render(props, { context });

	head += ssrComponents.toHead(opt?.ssrManifest ?? {});
	head += cache.toHead();

	return {
		status,
		fields: {
			head,
			body: html
		}
	};
}

export { routes };