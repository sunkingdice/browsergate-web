export const LISTMONK_URL = 'https://list.browsergate.eu';

export const LIST_UUID = '8c475cb9-680e-43e7-b74c-77408feb0326';

export const USER_TYPES: Record<string, string> = {
	journalist: 'Journalist',
	researcher: 'Researcher',
	lawyer: 'Lawyer',
	affected_user: 'Affected LinkedIn user',
	developer: 'Developer / Technical',
	other: 'Other'
};

export const LANGUAGES = [
	{ code: 'en', label: 'English' },
	{ code: 'de', label: 'Deutsch' },
	{ code: 'fr', label: 'Français' },
	{ code: 'es', label: 'Español' },
	{ code: 'nl', label: 'Nederlands' }
] as const;
