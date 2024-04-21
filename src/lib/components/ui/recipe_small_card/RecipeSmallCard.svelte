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
	export let recipe: recipes;
</script>

<Card.Root class="bg-white border-navyBlue">
	<Card.Header>
		<Card.Title>{recipe.name}</Card.Title>
		<Card.Description>{recipe.description}</Card.Description>
	</Card.Header>
	<Card.Footer>
		<div class="grid grid-cols-4 gap-1">
			{#if recipe.is_vegan}
				<RecipeLabel icon="vegetarian" text="Vegan" />
			{/if}
			{#if recipe.is_vegetarian}
				<RecipeLabel icon="vegetarian" text="Vegetarian" />
			{/if}
			{#if recipe.is_gluten_free}
				<RecipeLabel icon="gluten_free" text="Gluten Free" />
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
			{#if recipe.is_pork_free}
				<Badge>Pork Free</Badge>
			{/if}
			{#if recipe.is_red_meat_free}
				<Badge>Red Meat Free</Badge>
			{/if}
			{#if recipe.is_poultry_free}
				<Badge>Poulty Free</Badge>
			{/if}
			{#if recipe.is_grain_free}
				<Badge>Grain Free</Badge>
			{/if}
			{#if recipe.is_egg_free}
				<Badge>Egg Free</Badge>
			{/if}
			{#if recipe.is_sugar_free}
				<Badge>Sugar Free</Badge>
			{/if}
			{#if recipe.is_low_sodium}
				<Badge>Low Sodium</Badge>
			{/if}
			{#if recipe.is_low_fat}
				<Badge>Low Fat</Badge>
			{/if}
			{#if recipe.is_low_carb}
				<Badge>Low Carb</Badge>
			{/if}
			{#if recipe.is_high_protein}
				<Badge>High Protein</Badge>
			{/if}
			{#if recipe.is_organic}
				<Badge>Organic</Badge>
			{/if}
			{#if recipe.is_paleo}
				<Badge>Paleo</Badge>
			{/if}
			{#if recipe.is_keto}
				<Badge>Keto</Badge>
			{/if}
			{#if recipe.is_favorite}
				<Badge>Favorite</Badge>
			{/if}
		</div>
	</Card.Footer>
</Card.Root>
