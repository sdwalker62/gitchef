<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import RecipeSmallCard from '$lib/components/ui/recipe_small_card/RecipeSmallCard.svelte';
	import { recipesArr } from '$lib/stores';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import type { recipes } from '@prisma/client';

	export let data: PageData;
</script>

<Tabs.Root>
	<Tabs.List class="grid w-full grid-cols-2">
		<Tabs.Trigger value="all">All</Tabs.Trigger>
		<Tabs.Trigger value="favorites">Favorites</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="all">
		<div class="recipe-grid">
			{#each data.recipes as recipe}
				<a href="/recipes/{recipe.name}">
					<RecipeSmallCard {recipe} />
				</a>
			{/each}
		</div>
	</Tabs.Content>
	<Tabs.Content value="favorites">
		<div class="recipe-grid">
			{#each data.recipes as recipe}
				<RecipeSmallCard {recipe} />
			{/each}
		</div>
	</Tabs.Content>
</Tabs.Root>

<style>
	.recipe-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		column-gap: 10px;
		padding: 10px;
		width: 100%;
		max-width: 100vw;
	}
</style>
