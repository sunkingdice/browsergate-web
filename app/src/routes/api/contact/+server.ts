import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

const SMTP_HOST = 'smtp.migadu.com';
const SMTP_PORT = 465;
const SMTP_USER = 'admin@browsergate.org';
const RECIPIENT = 'admin@browsergate.org';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;
const MIN_SUBMIT_TIME_MS = 2000;

const ipLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const timestamps = (ipLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
	ipLog.set(ip, timestamps);
	if (timestamps.length >= RATE_MAX) return true;
	timestamps.push(now);
	return false;
}

function getTransporter() {
	const password = env.SMTP_PASSWORD;
	if (!password) throw new Error('SMTP_PASSWORD not set');
	return nodemailer.createTransport({
		host: SMTP_HOST,
		port: SMTP_PORT,
		secure: true,
		auth: { user: SMTP_USER, pass: password }
	});
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const ip = getClientAddress();
	if (isRateLimited(ip)) {
		return json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
	}

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { name, email, subject, message, website, _t } = body as {
		name: string;
		email: string;
		subject: string;
		message: string;
		website?: string;
		_t?: number;
	};

	if (website) {
		return json({ ok: true });
	}

	if (_t && Date.now() - _t < MIN_SUBMIT_TIME_MS) {
		return json({ ok: true });
	}

	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		return json({ error: 'Name is required' }, { status: 400 });
	}
	if (!email || typeof email !== 'string' || !email.includes('@')) {
		return json({ error: 'Valid email is required' }, { status: 400 });
	}
	if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
		return json({ error: 'Subject is required' }, { status: 400 });
	}
	if (!message || typeof message !== 'string' || message.trim().length === 0) {
		return json({ error: 'Message is required' }, { status: 400 });
	}
	if (message.length > 10000) {
		return json({ error: 'Message too long (max 10,000 characters)' }, { status: 400 });
	}

	try {
		const transporter = getTransporter();
		await transporter.sendMail({
			from: `"BrowserGate Contact" <${SMTP_USER}>`,
			replyTo: `"${name.trim()}" <${email.trim()}>`,
			to: RECIPIENT,
			subject: `[Contact] ${subject.trim()}`,
			text: `From: ${name.trim()} <${email.trim()}>\nSubject: ${subject.trim()}\n\n${message.trim()}`
		});

		return json({ ok: true });
	} catch (err) {
		console.error('SMTP error:', err);
		return json({ error: 'Failed to send message. Please try again later.' }, { status: 503 });
	}
};
