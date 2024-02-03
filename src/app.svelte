<script>
	import './app.scss';
	import Navigation from './layout/navigation.svelte';
	import Footer from './layout/footer.svelte';

	export let component;
	export let props;
</script>

<main>
	{#key component}
		<svelte:component this={component} {...props} />
	{/key}
</main>