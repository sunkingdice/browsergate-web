<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	let name = $state('');
	let email = $state('');
	let homepage = $state('');
	let toolName = $state('');
	let description = $state('');
	let euUsers = $state('');
	let euUserType = $state('');

	let loading = $state(true);
	let submitting = $state(false);
	let error = $state('');
	let lookupError = $state('');

	const uuid = page.url.searchParams.get('uuid') || '';

	async function loadSubscriber() {
		if (!uuid) {
			lookupError = 'No subscriber ID provided.';
			loading = false;
			return;
		}

		try {
			const res = await fetch(`${base}/api/optin/lookup?uuid=${encodeURIComponent(uuid)}`);
			if (!res.ok) {
				const data = await res.json();
				lookupError = data.error || 'Could not load your information.';
				loading = false;
				return;
			}
			const data = await res.json();
			name = data.name;
			email = data.email;
		} catch {
			lookupError = 'Something went wrong. Please try again later.';
		}
		loading = false;
	}

	loadSubscriber();

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		submitting = true;

		try {
			const res = await fetch(`${base}/api/optin`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					uuid,
					homepage: homepage.trim(),
					toolName: toolName.trim(),
					description: description.trim(),
					euUsers,
					euUserType: euUsers === 'yes' ? euUserType : ''
				})
			});

			const data = await res.json();

			if (!res.ok) {
				error = data.error || 'Something went wrong.';
				submitting = false;
				return;
			}

			goto(`${base}/optin/success`);
		} catch {
			error = 'Network error. Please try again.';
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Join Fairlinked — LinkedIn Tool Maker Updates</title>
</svelte:head>

<div class="mx-auto max-w-xl px-4 py-12">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900">Fairlinked — LinkedIn Tool Maker Updates</h1>
		<p class="mt-3 text-sm leading-relaxed text-gray-600">
			EU regulation gives every business the right to access LinkedIn data.
			Fairlinked is enforcing that right and building a legal pathway for tools
			like yours to operate without fear of takedown. Subscribe for legal strategy
			updates, regulatory filings, and Working Group opportunities.
		</p>
	</div>

	{#if loading}
		<div class="flex items-center gap-2 text-sm text-gray-500">
			<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
				<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25" />
				<path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" class="opacity-75" />
			</svg>
			Loading your information…
		</div>
	{:else if lookupError}
		<div class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
			{lookupError}
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="space-y-5">
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
					<input
						id="name"
						type="text"
						value={name}
						disabled
						class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm sm:text-sm"
					/>
				</div>
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
					<input
						id="email"
						type="email"
						value={email}
						disabled
						class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm sm:text-sm"
					/>
				</div>
			</div>

			<div>
				<label for="toolName" class="block text-sm font-medium text-gray-700">
					Tool / Extension Name <span class="text-red-500">*</span>
				</label>
				<input
					id="toolName"
					type="text"
					bind:value={toolName}
					required
					placeholder="e.g. LinkedHelper, Dux-Soup, …"
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
				/>
			</div>

			<div>
				<label for="homepage" class="block text-sm font-medium text-gray-700">Homepage URL</label>
				<input
					id="homepage"
					type="url"
					bind:value={homepage}
					placeholder="https://your-tool.com"
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
				/>
			</div>

			<div>
				<label for="description" class="block text-sm font-medium text-gray-700">
					What does your tool do? <span class="text-red-500">*</span>
				</label>
				<textarea
					id="description"
					bind:value={description}
					required
					rows={3}
					placeholder="A brief description of your tool's purpose…"
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
				></textarea>
			</div>

			<fieldset>
				<legend class="text-sm font-medium text-gray-700">
					Do you have users located in the EU? <span class="text-red-500">*</span>
				</legend>
				<div class="mt-2 flex gap-6">
					<label class="flex items-center gap-2 text-sm text-gray-700">
						<input type="radio" name="euUsers" value="yes" bind:group={euUsers} required class="text-brand focus:ring-brand" />
						Yes
					</label>
					<label class="flex items-center gap-2 text-sm text-gray-700">
						<input type="radio" name="euUsers" value="no" bind:group={euUsers} class="text-brand focus:ring-brand" />
						No
					</label>
				</div>
			</fieldset>

			{#if euUsers === 'yes'}
				<fieldset class="ml-4 border-l-2 border-brand/20 pl-4">
					<legend class="text-sm font-medium text-gray-700">
						Are your EU users primarily… <span class="text-red-500">*</span>
					</legend>
					<div class="mt-2 flex flex-col gap-2">
						<label class="flex items-center gap-2 text-sm text-gray-700">
							<input type="radio" name="euUserType" value="business" bind:group={euUserType} required class="text-brand focus:ring-brand" />
							Business users
						</label>
						<label class="flex items-center gap-2 text-sm text-gray-700">
							<input type="radio" name="euUserType" value="endusers" bind:group={euUserType} class="text-brand focus:ring-brand" />
							End users (consumers)
						</label>
						<label class="flex items-center gap-2 text-sm text-gray-700">
							<input type="radio" name="euUserType" value="both" bind:group={euUserType} class="text-brand focus:ring-brand" />
							Both
						</label>
					</div>
				</fieldset>
			{/if}

			{#if error}
				<div class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
					{error}
				</div>
			{/if}

			<button
				type="submit"
				disabled={submitting}
				class="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-50"
			>
				{#if submitting}
					Adding you…
				{:else}
					Add me to the list
				{/if}
			</button>

			<p class="text-center text-xs text-gray-400">
				You can unsubscribe at any time.
			</p>
		</form>
	{/if}
</div>
