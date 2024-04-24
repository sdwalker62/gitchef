<script lang="ts">
	import type { recipes } from '@prisma/client';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Description } from 'formsnap';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import RecipeLabel from '../recipe_label/RecipeLabel.svelte';
	// import { Us } from 'svelte-flag-icons';
	export let recipe: recipes;
</script>

<Card.Root class="bg-white border-navyBlue">
	<Card.Header>
		<Card.Title>
			<div class="flex flex-row justify-between w-full items-center">
				{recipe.name}
				<!-- <Us size="15" /> -->
			</div>
		</Card.Title>

		<Card.Description>{recipe.description}</Card.Description>
	</Card.Header>
	<Card.Footer>
		<div class="grid grid-cols-9 gap-1">
			{#if recipe.is_vegan}
				<RecipeLabel icon="vegetarian" text="Vegan" />
			{/if}
			{#if recipe.is_vegetarian}
				<RecipeLabel icon="vegetarian" text="Vegetarian" />
			{/if}
			{#if recipe.is_gluten_free || recipe.is_grain_free}
				<RecipeLabel icon="gluten_free" text="Wheat/Gluten Free" />
			{/if}
			{#if recipe.is_dairy_free}
				<RecipeLabel icon="dairy_free" text="Dairy Free" />
			{/if}
			{#if recipe.is_nut_free}
				<RecipeLabel icon="nut_free" text="Nut Free" />
			{/if}
			{#if recipe.is_soy_free}
				<RecipeLabel icon="soy_free" text="Soy Free" />
			{/if}
			{#if recipe.is_fish_free}
				<RecipeLabel icon="fish_free" text="Fish Free" />
			{/if}
			{#if !recipe.is_shellfish_free}
				<RecipeLabel icon="shellfish" text="Contains Shellfish" />
			{/if}
			{#if !recipe.is_pork_free}
				<RecipeLabel icon="pork" text="Contains Pork" />
			{/if}
			{#if !recipe.is_red_meat_free}
				<RecipeLabel icon="beef" text="Contains Beef" />
			{/if}
			{#if recipe.is_poultry_free}
				<RecipeLabel icon="poulty" text="Contains Poulty" />
			{/if}
			{#if recipe.is_sugar_free}
				<RecipeLabel icon="sugar_free" text="Sugar Free" />
			{/if}
			{#if recipe.is_low_sodium}
				<RecipeLabel icon="low" text="Low Sodium" />
			{/if}
			{#if recipe.is_low_fat}
				<RecipeLabel icon="low" text="Low Fat" />
			{/if}
			{#if recipe.is_low_carb}
				<RecipeLabel icon="low" text="Low Carb" />
			{/if}
			{#if recipe.is_high_protein}
				<RecipeLabel icon="high" text="High Protein" />
			{/if}
			{#if recipe.is_organic}
				<RecipeLabel icon="organic" text="Organic" />
			{/if}
			<!-- {#if recipe.is_paleo}
				<Badge>Paleo</Badge>
			{/if}
			{#if recipe.is_keto}
				<Badge>Keto</Badge>
			{/if} -->
			{#if recipe.is_favorite}
				<RecipeLabel icon="favorite" text="Favorited" />
			{/if}
		</div>
	</Card.Footer>
</Card.Root>
