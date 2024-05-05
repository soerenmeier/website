import type Request from 'fire-svelte/routing/Request';
import type Route from 'fire-svelte/routing/Route';
import * as routes from './pages/routes';
import type SsrCache from 'fire-svelte/ssr/SsrCache';

// should return { status, props }
export async function handleRoute(
	req: Request,
	route: Route | null,
	cache: SsrCache,
) {
	if (route) {
		let comp, pageProps;
		try {
			comp = await route.load(req);

			if (typeof comp.loadProps === 'function')
				pageProps = await comp.loadProps(route.toProps(req), cache);
			else pageProps = {};
		} catch (e) {
			console.log('error', e);
			return {
				status: 500,
				props: {
					component: routes.NotFound,
					props: {},
				},
			};
		}

		return {
			status: 200,
			props: {
				component: comp.default,
				props: pageProps,
			},
		};
	}

	return {
		status: 404,
		props: {
			component: routes.NotFound,
			props: {},
		},
	};
}
