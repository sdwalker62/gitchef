<script lang="ts">
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import { AspectRatio } from '$lib/components/ui/aspect-ratio';
	// import logo from '$lib/assets/logo.jpg?enhanced';
	import * as Menubar from '$lib/components/ui/menubar/index.js';
	import DarkmodeSwitch from '$lib/components/ui/darkmode-switch/DarkmodeSwitch.svelte';
	import ProfileDropdown from '$lib/components/ui/profile-dropdown/ProfileDropdown.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	let isLoggedIn = true;
</script>

<ModeWatcher defaultMode={'dark'} />
<div class="flex h-fit max-h-fit flex-col items-center justify-between">
	<div id="nav-bar" class="sticky flex w-full items-center justify-between p-2">
		<div class="flex items-center">
			<Button href="/" class=" m-0 h-[60px] w-[60px] bg-transparent p-0">
				<!-- <enhanced:img
					src={logo}
					alt="Mithral Labs logo"
					class="h-full w-full rounded-md object-cover"
				/> -->
			</Button>
			<div class=" flex items-end px-4">
				<h1 class="scroll-m-20 align-baseline text-4xl font-normal tracking-tight lg:text-5xl">
					Git Chef
				</h1>
			</div>
		</div>
		<div class="mx-2 flex gap-2">
			{#if isLoggedIn}
				<Button href="/profile/dalton">My Recipes</Button>
			{/if}
			<Menubar.Root>
				<Menubar.Menu>
					<Menubar.Trigger>Solutions</Menubar.Trigger>
					<Menubar.Content>
						<Menubar.Item>Testing/Evaluation</Menubar.Item>
					</Menubar.Content>
				</Menubar.Menu>
				<Menubar.Menu>
					<Menubar.Trigger>Documentation</Menubar.Trigger>
					<Menubar.Content>
						<Menubar.Item>Computer Vision</Menubar.Item>
						<Menubar.Item>Natural Language Processing</Menubar.Item>
						<Menubar.Item>Reinforcement Learning</Menubar.Item>
						<Menubar.Item>Classical Machine Learning</Menubar.Item>
						<Menubar.Separator />
						<Menubar.Item>FAQ</Menubar.Item>
					</Menubar.Content>
				</Menubar.Menu>
				<Menubar.Menu>
					<Menubar.Trigger>Contact</Menubar.Trigger>
					<Menubar.Content>
						<Menubar.Separator />
						<Menubar.Item>Email</Menubar.Item>
					</Menubar.Content>
				</Menubar.Menu>
				<Menubar.Menu>
					<Menubar.Trigger>Pricing</Menubar.Trigger>
					<Menubar.Content>
						<Menubar.Item>Free</Menubar.Item>
						<Menubar.Item>Enterprise</Menubar.Item>
					</Menubar.Content>
				</Menubar.Menu>
			</Menubar.Root>
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
