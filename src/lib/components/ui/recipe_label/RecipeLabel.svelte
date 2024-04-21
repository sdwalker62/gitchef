<script lang="ts">
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

	export let icon: string;
	export let text: string;
</script>

<div class="bg-primaryBlue rounded-md flex flex-row w-full items-center gap-2 p-2">
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
	{/if}
	<p class="text-floralWhite text-sm font-semibold">{text}</p>
</div>
