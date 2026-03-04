<script lang="ts">
	import { base } from '$app/paths';
	import { USER_TYPES, LANGUAGES } from '$lib/config';

	let name = $state('');
	let email = $state('');
	let language = $state('en');
	let usertype = $state('');
	let classAction = $state(false);
	let privacy = $state(false);

	let status = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');
	let errorMessage = $state('');

	const usertypeEntries = Object.entries(USER_TYPES);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!privacy) {
			errorMessage = 'Please accept the privacy policy to continue.';
			status = 'error';
			return;
		}

		if (!usertype) {
			errorMessage = 'Please select how you want to join.';
			status = 'error';
			return;
		}

		status = 'submitting';
		errorMessage = '';

		try {
			const res = await fetch(`${base}/api/subscribe`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, language, usertype, classAction })
			});

			const data = await res.json();

			if (!res.ok) {
				errorMessage = data.error || 'Something went wrong.';
				status = 'error';
				return;
			}

			status = 'success';
		} catch {
			errorMessage = 'Network error. Please try again.';
			status = 'error';
		}
	}
</script>

<svelte:head>
	<title>Stay Informed — BrowserGate</title>
</svelte:head>

<div class="mx-auto max-w-lg px-4 py-12">
	{#if status === 'success'}
		<div class="rounded-md border border-emerald-200 bg-emerald-50 p-6 text-center">
			<svg class="mx-auto mb-3 h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<h2 class="text-lg font-semibold text-emerald-800">Check your inbox</h2>
			<p class="mt-2 text-sm text-emerald-700">
				We've sent a confirmation email to <strong>{email}</strong>. Click the link to confirm your subscription.
			</p>
		</div>
	{:else}
		<h1 class="mb-2 text-2xl font-bold text-gray-900">Stay informed</h1>
		<p class="mb-8 text-sm text-gray-600">
			Get updates on BrowserGate — new findings, legal developments, and ways to take action.
		</p>

		<form onsubmit={handleSubmit} class="space-y-5">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					required
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
					placeholder="Jane Doe"
				/>
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
					placeholder="you@example.com"
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="language" class="block text-sm font-medium text-gray-700">Language</label>
					<select
						id="language"
						bind:value={language}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
					>
						{#each LANGUAGES as lang}
							<option value={lang.code}>{lang.label}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="usertype" class="block text-sm font-medium text-gray-700">I want to join the mailing list as&hellip;</label>
					<select
						id="usertype"
						bind:value={usertype}
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
					>
						<option value="" disabled>Select&hellip;</option>
						{#each usertypeEntries as [key, label]}
							<option value={key}>{label}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="space-y-3 pt-2">
				<label class="flex items-start gap-3">
					<input
						type="checkbox"
						bind:checked={classAction}
						class="mt-0.5 rounded border-gray-300 text-brand focus:ring-brand"
					/>
					<span class="text-sm text-gray-700">
						I'm interested in learning more about upcoming class action suits
					</span>
				</label>

				<label class="flex items-start gap-3">
					<input
						type="checkbox"
						bind:checked={privacy}
						required
						class="mt-0.5 rounded border-gray-300 text-brand focus:ring-brand"
					/>
					<span class="text-sm text-gray-700">
						I agree to the <a href="/privacy/" class="text-brand underline hover:text-brand-dark">privacy policy</a>
					</span>
				</label>
			</div>

			{#if status === 'error'}
				<div class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{errorMessage}
				</div>
			{/if}

			<button
				type="submit"
				disabled={status === 'submitting'}
				class="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50"
			>
				{status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
			</button>
		</form>
	{/if}
</div>
