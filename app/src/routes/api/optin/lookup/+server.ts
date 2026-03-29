import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { LISTMONK_URL } from '$lib/config';

export const GET: RequestHandler = async ({ url }) => {
	const uuid = url.searchParams.get('uuid');

	if (!uuid || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
		return json({ error: 'Missing or invalid subscriber ID.' }, { status: 400 });
	}

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

	const sub = results[0];

	const attribs = sub.attribs || {};

	return json({
		name: sub.name || '',
		email: sub.email || '',
		attribs
	});
};
