<script module lang="ts">
	export let hideFooter = true;
</script>

<script lang="ts">
	type Drink = {
		name: string;
		price: number;
	};

	type User = {
		name: string;
		drinks: DrinkKey[];
	};

	type DrinkKey = keyof typeof DRINKS;

	const DRINKS = {
		coffee: { name: 'Kaffee', price: 4 },
		open: { name: 'Offen 3dl', price: 3.9 },
		bottle: { name: 'Flasche 3dl', price: 4.2 },
		stange: { name: 'Bier 3dl', price: 4.1 },
		gross: { name: 'Bier 5dl', price: 6.6 },
		berner: { name: 'Berner Müntschi', price: 5.5 },
	};

	let total: number | null = $state(null);
	let users: User[] = $state([]);

	// users = [
	// 	{ name: 'Sören', drinks: ['gross'] },
	// 	{ name: 'Sandro', drinks: [] },
	// ];

	// total = 20;

	function onAddUser(e: any) {
		e.preventDefault();

		const name = prompt('Name des Benutzers');
		if (!name) return;

		users.push({
			name,
			drinks: [],
		});
	}

	function onRemoveUser(userId: number) {
		users.splice(userId, 1);
	}

	function onAddDrink(e: any, userId: number) {
		e.preventDefault();

		const drink: DrinkKey = e.target.value;
		if (!drink) return;

		users[userId].drinks.push(drink);

		e.target.value = '';
	}

	function onRemoveDrink(userId: number, drinkId: number) {
		users[userId].drinks.splice(drinkId, 1);
	}

	function formatPrice(price: number) {
		return price.toFixed(2) + ' CHF';
	}

	function userTotal(
		users: User[],
		total: number | null,
		userId: number,
	): number {
		if (!total) return 0;

		// remove the value from all other drinks from the total, then divide by the number
		// of users and add our own drinks

		const drinksTotal = users
			.flatMap(u => u.drinks)
			.reduce((sum, drink) => sum + DRINKS[drink].price, 0);

		const shared = (total - drinksTotal) / users.length;
		const myDrinks = users[userId].drinks.reduce(
			(sum, drink) => sum + DRINKS[drink].price,
			0,
		);

		return shared + myDrinks;
	}
</script>

<svelte:head>
	<title>Billiardrechner</title>
</svelte:head>

<div class="intro">
	<h1>Billiardrechner</h1>
</div>

<div class="box">
	<div class="inner">
		<input
			type="number"
			name="total"
			placeholder="Total"
			bind:value={total}
		/>

		{#each users as user, userId}
			<div class="user">
				<div class="header">
					<h3>{user.name}</h3>
					<button class="remove" onclick={e => onRemoveUser(userId)}>
						X
					</button>

					<span class="user-total">
						{formatPrice(userTotal(users, total, userId))}
					</span>
				</div>

				{#each user.drinks as name, drinkId}
					{@const drink = DRINKS[name]}
					<div class="drink">
						<span>{drink.name} ({formatPrice(drink.price)})</span>

						<button
							class="remove"
							onclick={e => onRemoveDrink(userId, drinkId)}
						>
							X
						</button>
					</div>
				{/each}

				<div class="add-drink">
					<select
						name="new-drink"
						onchange={e => onAddDrink(e, userId)}
					>
						<option value="" disabled selected>
							Getränk hinzufügen
						</option>
						{#each Object.entries(DRINKS) as [key, drink]}
							<option value={key}>
								{drink.name} - {formatPrice(drink.price)}
							</option>
						{/each}
					</select>
				</div>
			</div>
		{/each}

		{#if total! > 0}
			<div class="add-user">
				<button onclick={onAddUser}>Spieler hinzufügen</button>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.intro {
		margin-top: 2rem;
		margin-bottom: 4rem;
	}

	h1 {
		font-size: 3rem;
		font-weight: 700;
		line-height: 1.5;
		text-align: center;
	}

	.inner {
		margin: 0 auto;
		max-width: 20rem;
	}

	input {
		width: 100%;
		padding: 0.5rem;
		background-color: transparent;
		border: 1px solid var(--white-40);
		color: var(--white);
	}

	.user {
		margin-top: 1.5rem;

		.header {
			display: flex;
		}
	}

	.user-total {
		font-weight: 600;
		margin-left: auto;
	}

	.drink {
		display: flex;
		margin-top: 0.5rem;
		justify-content: space-between;
	}

	.remove {
		padding-left: 0.5rem;
		background-color: transparent;
		color: var(--white);
		border: none;
		cursor: pointer;
	}

	.add-drink {
		margin-top: 0.5rem;
	}

	select {
		width: 100%;
		padding: 0.25rem 0.5rem;
		background-color: transparent;
		border: 1px solid var(--white-40);
		color: var(--white);

		option {
			background-color: black;
			color: var(--white);
		}
	}

	.add-user {
		margin-top: 2rem;

		button {
			width: 100%;
			padding: 0.5rem;
			background-color: transparent;
			border: 1px solid var(--white-40);
			color: var(--white);
			cursor: pointer;
		}
	}
</style>
