<script lang="ts">
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import { AspectRatio } from '$lib/components/ui/aspect-ratio';
	import logo from '$lib/images/logo.jpg?enhanced';
	import * as Menubar from '$lib/components/ui/menubar/index.js';
	import DarkmodeSwitch from '$lib/components/ui/darkmode-switch/DarkmodeSwitch.svelte';
	import ProfileDropdown from '$lib/components/ui/profile-dropdown/ProfileDropdown.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	let isLoggedIn = true;
</script>

<ModeWatcher defaultMode={'dark'} />
<div class=" top-bar bg-amber-50 flex flex-col items-center justify-between">
	<div id="nav-bar" class="sticky flex w-full items-center justify-between p-2">
		<div class="flex items-center">
			<Button href="/" class=" m-0 h-[60px] w-[60px] bg-transparent p-0">
				<enhanced:img
					src={logo}
					alt="Mithral Labs logo"
					class="h-full w-full rounded-md object-cover"
				/>
			</Button>
			<div class=" flex items-end px-4">
				<h1 class="title-font scroll-m-20 align-baseline text-4xl lg:text-5xl">Git Chef</h1>
			</div>
		</div>
		<div class="mx-2 flex gap-2">
			{#if isLoggedIn}
				<Button href="/profile/dalton">My Recipes</Button>
			{/if}
			{#if !isLoggedIn}
				<Button href="/sign-in">Sign In</Button>
				<Button variant="secondary" href="/sign-up">Sign Up</Button>
			{:else}
				<ProfileDropdown />
			{/if}
			<DarkmodeSwitch />
		</div>
	</div>
	<Separator />
</div>
<slot />

<style>
	.title-font {
		font-family: 'Playfair Display', serif;
		font-optical-sizing: auto;
		font-style: normal;
	}

	.top-bar {
		height: 80px;
	}
</style>
