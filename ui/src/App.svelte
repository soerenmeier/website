<script>
	import Background from './components/Background.svelte';

	import './app.scss';
	import Footer from './components/Footer.svelte';

	const { page } = $props();
</script>

<Background />

<main>
	<!-- {#key component} -->
	<svelte:component this={$page.component} {...$page.props} />
	<!-- {/key} -->
</main>

{#if !$page.hideFooter}
	<Footer />
{/if}
