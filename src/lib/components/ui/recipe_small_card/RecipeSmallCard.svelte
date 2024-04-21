<script lang="ts">
	import type { recipes } from '@prisma/client';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Description } from 'formsnap';
	export let recipe: recipes;
</script>

<Card.Root class="bg-white border-navyBlue">
	<Card.Header>
		<Card.Title>{recipe.name}</Card.Title>
		<Card.Description>{recipe.description}</Card.Description>
	</Card.Header>
</Card.Root>
