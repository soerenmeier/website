<script>
	import Blog from '@/layout/blog.svelte';

	export let html;
	export let attributes;
</script>

<Blog title={attributes.title} desc={attributes.description}>
	{@html html}
</Blog>