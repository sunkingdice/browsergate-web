import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { LISTMONK_URL, LIST_UUID, USER_TYPES } from '$lib/config';

export const POST: RequestHandler = async ({ request }) => {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { name, email, language, usertype, classAction } = body as {
		name: string;
		email: string;
		language: string;
		usertype: string;
		classAction: boolean;
	};

	if (!email || typeof email !== 'string' || !email.includes('@')) {
		return json({ error: 'Valid email is required' }, { status: 400 });
	}

	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		return json({ error: 'Name is required' }, { status: 400 });
	}

	if (!USER_TYPES[usertype]) {
		return json({ error: 'Please select a user type' }, { status: 400 });
	}

	const payload = {
		email: email.trim().toLowerCase(),
		name: name.trim(),
		list_uuids: [LIST_UUID],
		attribs: {
			language: language || 'en',
			usertype,
			class_action_interest: !!classAction
		}
	};

	try {
		const res = await fetch(`${LISTMONK_URL}/api/public/subscription`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			const text = await res.text();
			console.error('Listmonk error:', res.status, text);
			return json({ error: 'Subscription failed. Please try again.' }, { status: 502 });
		}

		return json({ ok: true });
	} catch (err) {
		console.error('Listmonk unreachable:', err);
		return json({ error: 'Service unavailable. Please try again later.' }, { status: 503 });
	}
};
