import Router from 'fire-svelte/routing/Router';
import NotFound from './notfound.svelte';
import { register as registerBlogs } from '@/blog/routes';

export function register(router: Router) {
	router.register('/', () => import('./index.svelte'));

	registerBlogs(router);
}

export { NotFound };
