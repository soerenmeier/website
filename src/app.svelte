<script>
	import './app.css';
	import Navigation from './layout/navigation.svelte';
	import Footer from './layout/footer.svelte';

	export let page;
</script>

<!-- <header>
	<Navigation />
</header> -->

<main>
	{#key page}
		<svelte:component this={page.component} {...page.props} />
	{/key}
</main>


<!-- <footer>
	<Footer />
</footer> -->