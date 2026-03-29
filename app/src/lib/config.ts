export const LISTMONK_URL = 'https://list.browsergate.eu';

export const LIST_UUID = '8c475cb9-680e-43e7-b74c-77408feb0326'; // "All Browsergate" (public, double opt-in)

export const DEVELOPERS_LIST_UUID = 'b6fce36a-3f41-4421-bda7-1c3112a384b1'; // "Developers-All" (private, single opt-in)

export const FAIRLINKED_LIST_UUID = 'b3936a64-8642-43d5-9304-210aa6e75855'; // "Fairlinked - LinkedIn Tool Maker Updates" (public, single opt-in)
export const FAIRLINKED_LIST_ID = 4;

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
