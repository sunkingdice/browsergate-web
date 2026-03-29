import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { LISTMONK_URL, FAIRLINKED_LIST_ID } from '$lib/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

function verifySignature(email: string, sig: string): boolean {
	const secret = env.OPTIN_SECRET;
	if (!secret) return false;
	const expected = createHmac('sha256', secret).update(email.toLowerCase().trim()).digest('hex');
	try {
		return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
	} catch {
		return false;
	}
}

export const GET: RequestHandler = async ({ url }) => {
	const email = url.searchParams.get('email');
	const sig = url.searchParams.get('sig');

	if (!email || !sig) {
		return new Response('Missing parameters.', { status: 400 });
	}

	if (!verifySignature(email, sig)) {
		return new Response('Invalid or expired link.', { status: 403 });
	}

	const user = env.LISTMONK_ADMIN_USER;
	const pass = env.LISTMONK_ADMIN_PASS;
	if (!user || !pass) {
		return new Response('Server misconfigured.', { status: 503 });
	}

	const authHeader = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');

	// Look up subscriber by email
	const searchRes = await fetch(
		`${LISTMONK_URL}/api/subscribers?query=subscribers.email='${encodeURIComponent(email.toLowerCase().trim())}'&per_page=1`,
		{ headers: { Authorization: authHeader } }
	);

	if (!searchRes.ok) {
		return new Response('Failed to look up subscriber.', { status: 502 });
	}

	const searchData = await searchRes.json();
	const results = searchData?.data?.results;
	if (!results || results.length === 0) {
		return new Response('Subscriber not found.', { status: 404 });
	}

	const subscriberId = results[0].id;

	// Add subscriber to Fairlinked list
	const addRes = await fetch(`${LISTMONK_URL}/api/subscribers/lists`, {
		method: 'PUT',
		headers: {
			Authorization: authHeader,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			ids: [subscriberId],
			action: 'add',
			target_list_ids: [FAIRLINKED_LIST_ID],
			status: 'confirmed'
		})
	});

	if (!addRes.ok) {
		console.error('Listmonk add-to-list error:', addRes.status, await addRes.text());
		return new Response('Failed to update subscription.', { status: 502 });
	}

	redirect(303, '/optin/success');
};
