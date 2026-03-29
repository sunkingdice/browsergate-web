<script>
  const USER_TYPES = {
    journalist: 'Journalist',
    legal: 'Legal / Law Enforcement',
    commercial_user: 'Commercial LinkedIn user',
    toolmaker: 'LinkedIn Toolmaker',
    other: 'Other',
  };

  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'nl', label: 'Nederlands' },
  ];

  let name = $state('');
  let email = $state('');
  let language = $state('en');
  let usertype = $state('');
  let classAction = $state(false);
  let privacy = $state(false);

  let status = $state('idle');
  let errorMessage = $state('');

  async function handleSubmit(e) {
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
      const res = await fetch('/app/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, language, usertype, classAction }),
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

{#if status === 'success'}
  <div class="sf-success">
    <svg class="sf-check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h3 class="sf-success-title">Check your inbox</h3>
    <p class="sf-success-text">
      We've sent a confirmation email to <strong>{email}</strong>. Click the link to confirm your subscription.
    </p>
  </div>
{:else}
  <form onsubmit={handleSubmit} class="sf-form">
    <div class="sf-field">
      <label for="sf-name">Name</label>
      <input id="sf-name" type="text" bind:value={name} required placeholder="Jane Doe" />
    </div>

    <div class="sf-field">
      <label for="sf-email">Email</label>
      <input id="sf-email" type="email" bind:value={email} required placeholder="you@example.com" />
    </div>

    <div class="sf-row">
      <div class="sf-field">
        <label for="sf-language">Language</label>
        <select id="sf-language" bind:value={language}>
          {#each LANGUAGES as lang}
            <option value={lang.code}>{lang.label}</option>
          {/each}
        </select>
      </div>

      <div class="sf-field">
        <label for="sf-usertype">I want to join the mailing list as&hellip;</label>
        <select id="sf-usertype" bind:value={usertype} required>
          <option value="" disabled>Select&hellip;</option>
          {#each Object.entries(USER_TYPES) as [key, label]}
            <option value={key}>{label}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="sf-checkboxes">
      <label class="sf-checkbox">
        <input type="checkbox" bind:checked={classAction} />
        <span>I'm interested in learning more about upcoming class action suits</span>
      </label>

      <label class="sf-checkbox">
        <input type="checkbox" bind:checked={privacy} required />
        <span>I agree to the <a href="/privacy/">privacy policy</a></span>
      </label>
    </div>

    {#if status === 'error'}
      <div class="sf-error">{errorMessage}</div>
    {/if}

    <button type="submit" disabled={status === 'submitting'} class="sf-submit">
      {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
    </button>
  </form>
{/if}

<style>
  .sf-form {
    max-width: 480px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #333;
  }

  .sf-field {
    margin-bottom: 1rem;
  }

  .sf-field label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    font-size: 0.8125rem;
    color: #444;
  }

  .sf-field input,
  .sf-field select {
    display: block;
    width: 100%;
    padding: 0.5rem 0.65rem;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    font-size: 0.875rem;
    color: #333;
    background: #fff;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }

  .sf-field input:focus,
  .sf-field select:focus {
    outline: none;
    border-color: #0E76A8;
    box-shadow: 0 0 0 2px rgba(14, 118, 168, 0.15);
  }

  .sf-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .sf-checkboxes {
    margin: 1.25rem 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .sf-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    cursor: pointer;
  }

  .sf-checkbox input {
    margin-top: 2px;
    accent-color: #0E76A8;
  }

  .sf-checkbox span {
    font-size: 0.8125rem;
    color: #555;
  }

  .sf-checkbox a {
    color: #0E76A8;
    text-decoration: underline;
  }

  .sf-checkbox a:hover {
    color: #0a5f88;
  }

  .sf-error {
    margin-bottom: 1rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid #fca5a5;
    border-radius: 4px;
    background: #fef2f2;
    font-size: 0.8125rem;
    color: #991b1b;
  }

  .sf-submit {
    display: block;
    width: 100%;
    padding: 0.6rem;
    border: none;
    border-radius: 4px;
    background: #0E76A8;
    color: #fff;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }

  .sf-submit:hover {
    background: #0a5f88;
  }

  .sf-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sf-success {
    max-width: 480px;
    padding: 1.5rem;
    border: 1px solid #a7f3d0;
    border-radius: 6px;
    background: #ecfdf5;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .sf-check-icon {
    width: 2.5rem;
    height: 2.5rem;
    margin: 0 auto 0.75rem;
    color: #10b981;
  }

  .sf-success-title {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #065f46;
  }

  .sf-success-text {
    margin: 0;
    font-size: 0.8125rem;
    color: #047857;
  }
</style>
