<script>
	import Background from './components/Background.svelte';

	import './app.scss';
	import Footer from './components/Footer.svelte';

	const { page } = $props();

	const Component = $derived($page.component);
</script>

<Background />

<main>
	<!-- {#key component} -->
	<Component {...$page.props} />
	<!-- {/key} -->
</main>

{#if !$page.hideFooter}
	<Footer />
{/if}
