import NotFound from './notfound.svelte';

export function register(router) {
	router.register('/', () => import('./index.svelte'));
}

export { NotFound };