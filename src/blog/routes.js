const routes = import.meta.glob('./*.md');

export function register(router) {
	// router.register('/blog/setup-ssh', () => import('./setup-ssh.svelte'));

	for (const path in routes) {
		router.register(
			'/blog/' + path.substring(2, path.length - 3),
			async () => {
				const { html, attributes } = await routes[path]();
				const {
				default: MdBlog
				} = await import('@/templates/mdblog.svelte');

				return {
					loadProps: () => {
						return { html, attributes }
					},
					default: MdBlog
				}
			}
		);
	}
}