<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import RecipeSmallCard from '$lib/components/ui/recipe_small_card/RecipeSmallCard.svelte';
	import { recipesArr } from '$lib/stores';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import type { recipes } from '@prisma/client';

	export let data: PageData;
</script>

<div class="tab-container bg-amber-50">
	<Tabs.Root class=" ">
		<Tabs.List class="grid w-full grid-cols-2  bg-amber-100">
			<Tabs.Trigger class="data-[state=active]:bg-amber-200" value="all">All</Tabs.Trigger>
			<Tabs.Trigger class="data-[state=active]:bg-amber-200" value="favorites"
				>Favorites</Tabs.Trigger
			>
		</Tabs.List>
		<Tabs.Content value="all">
			<div class=" bg-amber-50 recipe-grid">
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
</div>

<style>
	.recipe-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		column-gap: 10px;
		padding: 10px;
		width: 100%;
		max-width: 100vw;
	}

	.tab-container {
		width: 100%;
		height: calc(100vh - 80px);
	}
</style>
