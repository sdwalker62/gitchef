<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import RecipeSmallCard from '$lib/components/ui/recipe_small_card/RecipeSmallCard.svelte';
	import { recipesArr } from '$lib/stores';
	import { Star } from 'lucide-svelte';
	import { Search } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import type { recipes } from '@prisma/client';
	import { Filter } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { ArrowDownUp } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input/index.js';

	export let data: PageData;
	console.log(data.recipes[0]);
</script>

<div class="tab-container bg-amber-50 dark:bg-nb-700 p-2">
	<Tabs.Root>
		<div class="flex flex-row justify-between rounded-md dark:bg-transparent">
			<Tabs.List class="grid h-full w-[250px] grid-cols-2 dark:bg-nb-50/30 bg-amber-100">
				<Tabs.Trigger
					class="h-[30px] text-md dark:data-[state=active]:bg-nb-700 data-[state=active]:bg-amber-50 dark:data-[state=active]:text-floralWhite dark:text-floralWhite dark:text-nb-50 text-nb-700"
					value="all">All Recipes</Tabs.Trigger
				>
				<Tabs.Trigger
					class="h-[30px] dark:data-[state=active]:bg-nb-700 data-[state=active]:bg-amber-50 dark:data-[state=active]:text-floralWhite dark:text-floralWhite text-nb-700"
					value="favorites"><Star size={20} /></Tabs.Trigger
				>
			</Tabs.List>

			<!-- Filter -->
			<Drawer.Root>
				<Drawer.Trigger asChild let:builder>
					<Button builders={[builder]} class="dark:bg-transparent text-floralWhite rounded-md"
						><Filter class="text-floralWhite" /></Button
					>
				</Drawer.Trigger>
				<Drawer.Content class="bg-navyBlue">
					<Drawer.Footer>
						<Button>Submit</Button>
						<Drawer.Close asChild let:builder>
							<Button builders={[builder]} variant="outline">Cancel</Button>
						</Drawer.Close>
					</Drawer.Footer>
				</Drawer.Content>
			</Drawer.Root>
		</div>
		<Tabs.Content value="all">
			<div class="dark:bg-nb-700 bg-amber-50 grid gap-2 sm:grid-cols-1 xl:grid-cols-2">
				{#each data.recipes as recipe}
					<a href="/recipes/{recipe.name}">
						<RecipeSmallCard {recipe} />
					</a>
				{/each}
			</div>
		</Tabs.Content>
		<Tabs.Content value="favorites">
			<div class=" bg-amber-50 grid gap-2 sm:grid-cols-1 xl:grid-cols-2">
				{#each data.recipes as recipe}
					<RecipeSmallCard {recipe} />
				{/each}
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>

<style>
	.tab-container {
		width: 100%;
		height: calc(100vh - 80px);
	}
</style>
