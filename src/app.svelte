<script>
	import './app.scss';

	export let component;
	export let props;
</script>

<main>
	{#key component}
		<svelte:component this={component} {...props} />
	{/key}
</main>
