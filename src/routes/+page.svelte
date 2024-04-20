<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import RecipeSmallCard from '$lib/components/ui/recipe_small_card/RecipeSmallCard.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Tabs.Root>
	<Tabs.List class="grid w-full grid-cols-4">
		<Tabs.Trigger value="all">All</Tabs.Trigger>
		<Tabs.Trigger value="favorites">Favorites</Tabs.Trigger>
		<Tabs.Trigger value="recent">Recent</Tabs.Trigger>
		<Tabs.Trigger value="popular">Popular</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="all">
		<div class="main">
			{#each data.recipes as recipe}
				<RecipeSmallCard {recipe} />
			{/each}
		</div>
	</Tabs.Content>
	<Tabs.Content value="favorites">
		<div class="main">
			{#each data.recipes as recipe}
				<RecipeSmallCard {recipe} />
			{/each}
		</div>
	</Tabs.Content>
	<Tabs.Content value="recent">
		<div class="main">
			{#each data.recipes as recipe}
				<RecipeSmallCard {recipe} />
			{/each}
		</div>
	</Tabs.Content>
	<Tabs.Content value="popular">
		<div class="main">
			{#each data.recipes as recipe}
				<RecipeSmallCard {recipe} />
			{/each}
		</div>
	</Tabs.Content>
</Tabs.Root>
