import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { LISTMONK_URL, FAIRLINKED_LIST_ID } from '$lib/config';

export const POST: RequestHandler = async ({ request }) => {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { uuid, homepage, toolName, description, euUsers, euUserType } = body as {
		uuid: string;
		homepage: string;
		toolName: string;
		description: string;
		euUsers: string;
		euUserType: string;
	};

	if (!uuid || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
		return json({ error: 'Invalid subscriber ID.' }, { status: 400 });
	}

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

	const user = env.LISTMONK_ADMIN_USER;
	const pass = env.LISTMONK_ADMIN_PASS;
	if (!user || !pass) {
		return json({ error: 'Server misconfigured.' }, { status: 503 });
	}

	const authHeader = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');

	// Look up subscriber by UUID
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

	// Merge new attributes with existing ones
	const existingAttribs = subscriber.attribs || {};
	const updatedAttribs = {
		...existingAttribs,
		homepage: (homepage || '').trim(),
		tool_name: toolName.trim(),
		tool_description: description.trim(),
		eu_users: euUsers,
		eu_user_type: euUsers === 'yes' ? euUserType : null
	};

	// Preserve existing list IDs so PUT doesn't strip them
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

	// Add to Fairlinked list
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
};
