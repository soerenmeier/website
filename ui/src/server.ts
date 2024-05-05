import App from './App.svelte';
import Router from 'fire-svelte/routing/Router';
import SsrCache from 'fire-svelte/ssr/SsrCache';
import SsrComponents from 'fire-svelte/ssr/SsrComponents';
import * as routes from './pages/routes';
import { handleRoute } from './main';

// opt: { method, uri, ?ssrManifest }
// returns: { status, body, head }
export async function render(req: any, opt: any) {
	const cache = new SsrCache();
	const router = new Router();

	routes.register(router);

	req = router.initServer('http://' + req.headers.host + req.uri);

	const route = router.route(req);
	const { status, props } = await handleRoute(req, route, cache);

	const ssrComponents = new SsrComponents();
	const context = new Map();
	context.set('router', router);
	ssrComponents.addToContext(context);

	// @ts-ignore
	let { html, head } = App.render(props, { context });

	head += ssrComponents.toHead(opt?.ssrManifest ?? {});
	head += cache.toHead();

	return {
		status,
		fields: {
			head,
			body: html,
		},
	};
}

export { routes };
