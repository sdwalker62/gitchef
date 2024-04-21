<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { TriangleAlert } from 'lucide-svelte';
	import { ChevronDown } from 'lucide-svelte';
	import { ChevronUp } from 'lucide-svelte';
	import { Carrot } from 'lucide-svelte';
	import { WheatOff } from 'lucide-svelte';
	import { NutOff } from 'lucide-svelte';
	import { FishOff } from 'lucide-svelte';
	import { BeanOff } from 'lucide-svelte';
	import { MilkOff } from 'lucide-svelte';
	import { Beef } from 'lucide-svelte';
	import { Shell } from 'lucide-svelte';
	import { PiggyBank } from 'lucide-svelte';
	import { Egg } from 'lucide-svelte';
	import { CandyOff } from 'lucide-svelte';
	import { Tractor } from 'lucide-svelte';
	import { Star } from 'lucide-svelte';

	export let icon: string;
	export let text: string;
</script>

<Tooltip.Root>
	<Tooltip.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" size="icon" class="bg-navyBlue">
			{#if icon === 'warning'}
				<TriangleAlert />
			{:else if icon === 'vegetarian'}
				<Carrot class="text-green-300" />
			{:else if icon === 'down'}
				<ChevronDown class="text-red-300" />
			{:else if icon === 'up'}
				<ChevronUp class="text-green-300" />
			{:else if icon === 'gluten_free'}
				<WheatOff class="text-amber-300" />
			{:else if icon === 'nut_free'}
				<NutOff class="text-amber-300" />
			{:else if icon === 'fish_free'}
				<FishOff class="text-slate-300" />
			{:else if icon === 'soy_free'}
				<BeanOff class="text-amber-600" />
			{:else if icon === 'dairy_free'}
				<MilkOff class="text-white" />
			{:else if icon === 'shellfish'}
				<Shell class="text-rose-300" />
			{:else if icon === 'pork'}
				<PiggyBank class="text-pink-300" />
			{:else if icon === 'beef'}
				<Beef class="text-red-400" />
			{:else if icon === 'poulty'}
				<Egg class="text-white" />
			{:else if icon === 'sugar_free'}
				<CandyOff class="text-sky-400" />
			{:else if icon === 'low'}
				<ChevronDown class="text-red-300" />
			{:else if icon === 'high'}
				<ChevronUp class="text-green-300" />
			{:else if icon === 'organic'}
				<Tractor class="text-violet-300" />
			{:else if icon === 'favorite'}
				<Star class="text-yellow-300" />
			{/if}
		</Button>
	</Tooltip.Trigger>
	<Tooltip.Content>
		<p>{text}</p>
	</Tooltip.Content>
</Tooltip.Root>
