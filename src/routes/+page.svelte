<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import RecipeSmallCard from '$lib/components/ui/recipe_small_card/RecipeSmallCard.svelte';
	import { recipesArr } from '$lib/stores';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import type { recipes } from '@prisma/client';
	import { Filter } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { ArrowDownUp } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input/index.js';

	export let data: PageData;
</script>

<div class="tab-container bg-amber-50 px-2">
	<Tabs.Root>
		<Tabs.List class="grid w-full grid-cols-2 bg-amber-100">
			<Tabs.Trigger class="data-[state=active]:bg-amber-50 text-navyBlue" value="all"
				>All</Tabs.Trigger
			>
			<Tabs.Trigger class="data-[state=active]:bg-amber-50 text-navyBlue" value="favorites"
				>Favorites</Tabs.Trigger
			>
		</Tabs.List>
		<Tabs.Content value="all">
			<div class="flex flex-col">
				<div class="flex flex-row gap-1 p-2">
					<!-- Filter -->
					<Drawer.Root>
						<Drawer.Trigger asChild let:builder>
							<Button builders={[builder]} variant="outline" class="bg-primaryBlue text-floralWhite"
								><Filter class="bg-primaryBlue text-floralWhite" /></Button
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

					<!-- Sort -->
					<Drawer.Root>
						<Drawer.Trigger asChild let:builder>
							<Button builders={[builder]} variant="outline" class="bg-primaryBlue text-floralWhite"
								><ArrowDownUp class="bg-primaryBlue text-floralWhite" /></Button
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
					<form class="flex w-full max-w-sm items-center space-x-1">
						<Input type="search" placeholder="Search recipes" />
						<Button type="submit" class="bg-primaryBlue">Search</Button>
					</form>
				</div>
				<div class=" bg-amber-50 grid gap-1 sm:grid-cols-1 xl:grid-cols-2">
					{#each data.recipes as recipe}
						<a href="/recipes/{recipe.name}">
							<RecipeSmallCard {recipe} />
						</a>
					{/each}
				</div>
			</div>
		</Tabs.Content>
		<Tabs.Content value="favorites">
			<div class=" bg-amber-50 grid gap-1 sm:grid-cols-1 xl:grid-cols-2">
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
