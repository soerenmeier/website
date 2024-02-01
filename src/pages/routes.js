import NotFound from './notfound.svelte';
import { register as registerBlogs } from '@/blog/routes.js';

export function register(router) {
	router.register('/', () => import('./index.svelte'));

	registerBlogs(router);
}

export { NotFound };