<script lang="ts">
	import type { ExtendedHistoryMove } from '@/lib/wasm';
	import { onMount, untrack } from 'svelte';

	let {
		getId,
		extendedHistory,
	}: { getId: () => string; extendedHistory: ExtendedHistoryMove[] | null } =
		$props();

	let previousLength: number = -1;
	let toasts: ExtendedHistoryMove[] = $state([]);

	// i don't like this
	$effect(() => {
		if (!extendedHistory) return;

		if (extendedHistory.length < previousLength) {
			previousLength = -1;
		}

		if (previousLength === -1) {
			previousLength = extendedHistory.length;
			toasts = [];
			return;
		}

		if (previousLength < extendedHistory.length) {
			toasts = [
				...untrack(() => toasts),
				...extendedHistory
					.slice(previousLength)
					.filter(move => move.conId !== getId()),
			];
			previousLength = extendedHistory.length;
		}
	});

	function onClose(id: number) {
		toasts = toasts.filter((_, i) => i !== id);
	}
</script>

<!-- let's create a bubble notification, and maybe play even a sound -->
{#if toasts.length}
	<div class="toasts">
		{#each toasts
			.map((t, i) => [i, t] as [number, ExtendedHistoryMove])
			.reverse()
			.slice(0, 10) as [i, toast]}
			<button
				class="toast btn-style"
				title="close"
				onclick={() => onClose(i)}
			>
				{toast.name} played {toast.pgn}
			</button>
		{/each}
	</div>
{/if}

<style lang="scss">
	.toasts {
		position: fixed;
		bottom: 0;
		right: 0;
		padding: 1rem;
		z-index: 11;
	}

	.toast {
		display: block;
		width: 100%;
		margin-top: 0.5rem;
		background-color: black;
		/* padding: 0.5rem 1rem;
		gap: 0.5rem;
		justify-content: space-between;
		background-color: white;
		color: black;
		border: none;
		border-radius: 0;

		box-shadow: 2px 2px 0 var(--white-60);
		text-align: left;
		appearance: none; */
	}
</style>
