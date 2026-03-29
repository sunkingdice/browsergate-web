import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { LISTMONK_URL, FAIRLINKED_LIST_ID, FAIRLINKED_LIST_UUID } from '$lib/config';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const POST: RequestHandler = async ({ request }) => {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { uuid, name, email, homepage, toolName, description, euUsers, euUserType } = body as {
		uuid?: string;
		name?: string;
		email?: string;
		homepage: string;
		toolName: string;
		description: string;
		euUsers: string;
		euUserType: string;
	};

	if (!toolName || typeof toolName !== 'string' || toolName.trim().length === 0) {
		return json({ error: 'Tool name is required.' }, { status: 400 });
	}

	if (!description || typeof description !== 'string' || description.trim().length === 0) {
		return json({ error: 'Description is required.' }, { status: 400 });
	}

	if (!euUsers || !['yes', 'no'].includes(euUsers)) {
		return json({ error: 'Please answer the EU users question.' }, { status: 400 });
	}

	if (euUsers === 'yes' && !euUserType) {
		return json({ error: 'Please specify the type of EU users.' }, { status: 400 });
	}

	const attribs = {
		homepage: (homepage || '').trim(),
		tool_name: toolName.trim(),
		tool_description: description.trim(),
		eu_users: euUsers,
		eu_user_type: euUsers === 'yes' ? euUserType : null
	};

	// Existing subscriber flow (has UUID from email link)
	if (uuid && UUID_RE.test(uuid)) {
		return handleExistingSubscriber(uuid, attribs);
	}

	// New subscriber flow (filled in name + email manually)
	if (!email || typeof email !== 'string' || !email.includes('@')) {
		return json({ error: 'Valid email is required.' }, { status: 400 });
	}
	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		return json({ error: 'Name is required.' }, { status: 400 });
	}

	return handleNewSubscriber(name.trim(), email.trim().toLowerCase(), attribs);
};

async function handleExistingSubscriber(
	uuid: string,
	attribs: Record<string, unknown>
) {
	const user = env.LISTMONK_ADMIN_USER;
	const pass = env.LISTMONK_ADMIN_PASS;
	if (!user || !pass) {
		return json({ error: 'Server misconfigured.' }, { status: 503 });
	}

	const authHeader = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');

	const subRes = await fetch(
		`${LISTMONK_URL}/api/subscribers?query=subscribers.uuid='${uuid}'&per_page=1`,
		{ headers: { Authorization: authHeader } }
	);

	if (!subRes.ok) {
		return json({ error: 'Failed to look up subscriber.' }, { status: 502 });
	}

	const subData = await subRes.json();
	const results = subData?.data?.results;
	if (!results || results.length === 0) {
		return json({ error: 'Subscriber not found.' }, { status: 404 });
	}

	const subscriber = results[0];

	const existingAttribs = subscriber.attribs || {};
	const updatedAttribs = { ...existingAttribs, ...attribs };

	const existingListIds = (subscriber.lists || []).map((l: { id: number }) => l.id);

	const updateRes = await fetch(`${LISTMONK_URL}/api/subscribers/${subscriber.id}`, {
		method: 'PUT',
		headers: {
			Authorization: authHeader,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: subscriber.email,
			name: subscriber.name,
			status: subscriber.status,
			lists: existingListIds,
			attribs: updatedAttribs
		})
	});

	if (!updateRes.ok) {
		console.error('Listmonk update error:', updateRes.status, await updateRes.text());
		return json({ error: 'Failed to update subscriber.' }, { status: 502 });
	}

	const addRes = await fetch(`${LISTMONK_URL}/api/subscribers/lists`, {
		method: 'PUT',
		headers: {
			Authorization: authHeader,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			ids: [subscriber.id],
			action: 'add',
			target_list_ids: [FAIRLINKED_LIST_ID],
			status: 'confirmed'
		})
	});

	if (!addRes.ok) {
		console.error('Listmonk add-to-list error:', addRes.status, await addRes.text());
		return json({ error: 'Failed to add to list.' }, { status: 502 });
	}

	return json({ ok: true });
}

async function handleNewSubscriber(
	name: string,
	email: string,
	attribs: Record<string, unknown>
) {
	const payload = {
		email,
		name,
		list_uuids: [FAIRLINKED_LIST_UUID],
		attribs
	};

	try {
		const res = await fetch(`${LISTMONK_URL}/api/public/subscription`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			const text = await res.text();
			console.error('Listmonk public subscription error:', res.status, text);
			return json({ error: 'Subscription failed. Please try again.' }, { status: 502 });
		}

		return json({ ok: true });
	} catch (err) {
		console.error('Listmonk unreachable:', err);
		return json({ error: 'Service unavailable. Please try again later.' }, { status: 503 });
	}
}
