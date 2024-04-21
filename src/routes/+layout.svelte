<script lang="ts">
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import logo from '$lib/images/logo.jpg?enhanced';
	import sign from '$lib/images/light_gitchef_sign.png?enhanced';
	import DarkmodeSwitch from '$lib/components/ui/darkmode-switch/DarkmodeSwitch.svelte';
</script>

<ModeWatcher defaultMode={'dark'} />
<div
	class=" w-full top-bar dark:bg-navyBlue bg-amber-50 flex flex-row items-center justify-between"
>
	<div id="nav-bar" class="sticky flex w-full items-center justify-between p-2">
		<a href="/" class=" m-0 h-[60px] w-[60px] bg-transparent p-0">
			<enhanced:img src={logo} alt="Git Chef logo" class=" h-full w-full rounded-md object-cover" />
		</a>
		<enhanced:img
			src={sign}
			alt="Git Chef logo"
			class=" h-full w-[200px] max-h-[80px] rounded-md object-cover"
		/>
		<DarkmodeSwitch />
	</div>
</div>
<slot />

<style>
	.top-bar {
		height: 80px;
	}
</style>
