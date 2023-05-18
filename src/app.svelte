<script>
	import './app.css';
	import Navigation from './layout/navigation.svelte';
	import Footer from './layout/footer.svelte';

	export let page;
</script>

<header>
	<Navigation />
</header>

<main>
	<svelte:component this={page.comp} {...page.props} />
</main>


<footer>
	<Footer />
</footer>