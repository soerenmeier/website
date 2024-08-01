<script>
	import Blog from '@/layout/blog.svelte';

	let { html, attributes } = $props();
</script>

<Blog title={attributes.title} desc={attributes.description}>
	{@html html}
</Blog>
