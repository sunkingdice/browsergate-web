<script>
  let name = $state('');
  let email = $state('');
  let homepage = $state('');
  let toolName = $state('');
  let description = $state('');
  let euUsers = $state('');
  let euUserType = $state('');

  let status = $state('loading');
  let errorMessage = $state('');

  const uuid = new URLSearchParams(window.location.search).get('uuid') || '';
  const hasUuid = !!uuid;

  async function loadSubscriber() {
    if (!uuid) {
      status = 'idle';
      return;
    }

    try {
      const res = await fetch(`/app/api/optin/lookup?uuid=${encodeURIComponent(uuid)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        errorMessage = data.error || 'Could not load your information.';
        status = 'error';
        return;
      }
      const data = await res.json();
      name = data.name;
      email = data.email;
      status = 'idle';
    } catch {
      errorMessage = 'Something went wrong. Please try again later.';
      status = 'error';
    }
  }

  loadSubscriber();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!hasUuid) {
      if (!name.trim()) {
        errorMessage = 'Please enter your name.';
        status = 'form-error';
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        errorMessage = 'Please enter a valid email address.';
        status = 'form-error';
        return;
      }
    }
    if (!toolName.trim()) {
      errorMessage = 'Please enter your tool or extension name.';
      status = 'form-error';
      return;
    }
    if (!description.trim()) {
      errorMessage = 'Please describe what your tool does.';
      status = 'form-error';
      return;
    }
    if (!euUsers) {
      errorMessage = 'Please answer the EU users question.';
      status = 'form-error';
      return;
    }
    if (euUsers === 'yes' && !euUserType) {
      errorMessage = 'Please specify the type of EU users.';
      status = 'form-error';
      return;
    }

    status = 'submitting';
    errorMessage = '';

    try {
      const res = await fetch('/app/api/optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid: uuid || undefined,
          name: name.trim(),
          email: email.trim(),
          homepage: homepage.trim(),
          toolName: toolName.trim(),
          description: description.trim(),
          euUsers,
          euUserType: euUsers === 'yes' ? euUserType : '',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorMessage = data.error || 'Something went wrong.';
        status = 'form-error';
        return;
      }

      status = 'success';
    } catch {
      errorMessage = 'Network error. Please try again.';
      status = 'form-error';
    }
  }
</script>

{#if status === 'loading'}
  <div class="of-loading">
    <div class="of-spinner"></div>
    Loading your information…
  </div>
{:else if status === 'error'}
  <div class="of-error-box">{errorMessage}</div>
{:else if status === 'success'}
  <div class="of-success">
    <svg class="of-check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h3 class="of-success-title">You've been added!</h3>
    <p class="of-success-text">
      You're now subscribed to <strong>Fairlinked — LinkedIn Tool Maker Updates</strong>.
      We'll keep you posted on the campaign to grant all tool makers access to the LinkedIn API.
    </p>
  </div>
{:else}
  <form onsubmit={handleSubmit} class="of-form">
    <div class="of-row">
      <div class="of-field">
        <label for="of-name">Name {#if !hasUuid}<span class="of-required">*</span>{/if}</label>
        {#if hasUuid}
          <input id="of-name" type="text" value={name} disabled />
        {:else}
          <input id="of-name" type="text" bind:value={name} required placeholder="Jane Doe" />
        {/if}
      </div>
      <div class="of-field">
        <label for="of-email">Email {#if !hasUuid}<span class="of-required">*</span>{/if}</label>
        {#if hasUuid}
          <input id="of-email" type="email" value={email} disabled />
        {:else}
          <input id="of-email" type="email" bind:value={email} required placeholder="you@example.com" />
        {/if}
      </div>
    </div>

    <div class="of-field">
      <label for="of-tool-name">Tool / Extension Name <span class="of-required">*</span></label>
      <input
        id="of-tool-name"
        type="text"
        bind:value={toolName}
        required
        placeholder="e.g. LinkedHelper, Dux-Soup, …"
      />
    </div>

    <div class="of-field">
      <label for="of-homepage">Homepage URL</label>
      <input
        id="of-homepage"
        type="url"
        bind:value={homepage}
        placeholder="https://your-tool.com"
      />
    </div>

    <div class="of-field">
      <label for="of-description">What does your tool do? <span class="of-required">*</span></label>
      <textarea
        id="of-description"
        bind:value={description}
        required
        rows="3"
        placeholder="A brief description of your tool's purpose…"
      ></textarea>
    </div>

    <fieldset class="of-fieldset">
      <legend>Do you have users located in the EU? <span class="of-required">*</span></legend>
      <div class="of-radio-row">
        <label class="of-radio">
          <input type="radio" name="euUsers" value="yes" bind:group={euUsers} required />
          <span>Yes</span>
        </label>
        <label class="of-radio">
          <input type="radio" name="euUsers" value="no" bind:group={euUsers} />
          <span>No</span>
        </label>
      </div>
    </fieldset>

    {#if euUsers === 'yes'}
      <fieldset class="of-fieldset of-nested">
        <legend>Are your EU users primarily… <span class="of-required">*</span></legend>
        <div class="of-radio-col">
          <label class="of-radio">
            <input type="radio" name="euUserType" value="business" bind:group={euUserType} required />
            <span>Business users</span>
          </label>
          <label class="of-radio">
            <input type="radio" name="euUserType" value="endusers" bind:group={euUserType} />
            <span>End users (consumers)</span>
          </label>
          <label class="of-radio">
            <input type="radio" name="euUserType" value="both" bind:group={euUserType} />
            <span>Both</span>
          </label>
        </div>
      </fieldset>
    {/if}

    {#if status === 'form-error'}
      <div class="of-error">{errorMessage}</div>
    {/if}

    <button type="submit" disabled={status === 'submitting'} class="of-submit">
      {status === 'submitting' ? 'Adding you…' : 'Add me to the list'}
    </button>

    <p class="of-fine-print">You can unsubscribe at any time.</p>
  </form>
{/if}

<style>
  .of-form {
    max-width: 480px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #333;
  }

  .of-field {
    margin-bottom: 1rem;
  }

  .of-field label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    font-size: 0.8125rem;
    color: #444;
  }

  .of-required {
    color: #dc2626;
  }

  .of-field input,
  .of-field textarea {
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
    font-family: inherit;
  }

  .of-field input:disabled {
    background: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
  }

  .of-field textarea {
    resize: vertical;
    min-height: 4rem;
  }

  .of-field input:focus,
  .of-field textarea:focus {
    outline: none;
    border-color: #0E76A8;
    box-shadow: 0 0 0 2px rgba(14, 118, 168, 0.15);
  }

  .of-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .of-fieldset {
    border: none;
    padding: 0;
    margin: 0 0 1rem;
  }

  .of-fieldset legend {
    font-weight: 500;
    font-size: 0.8125rem;
    color: #444;
    margin-bottom: 0.5rem;
  }

  .of-nested {
    margin-left: 1rem;
    padding-left: 1rem;
    border-left: 2px solid rgba(14, 118, 168, 0.2);
  }

  .of-radio-row {
    display: flex;
    gap: 1.5rem;
  }

  .of-radio-col {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .of-radio {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    font-size: 0.8125rem;
    color: #555;
  }

  .of-radio input {
    accent-color: #0E76A8;
  }

  .of-error {
    margin-bottom: 1rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid #fca5a5;
    border-radius: 4px;
    background: #fef2f2;
    font-size: 0.8125rem;
    color: #991b1b;
  }

  .of-error-box {
    max-width: 480px;
    padding: 0.75rem 1rem;
    border: 1px solid #fca5a5;
    border-radius: 4px;
    background: #fef2f2;
    font-size: 0.8125rem;
    color: #991b1b;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .of-submit {
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

  .of-submit:hover {
    background: #0a5f88;
  }

  .of-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .of-fine-print {
    margin-top: 0.75rem;
    text-align: center;
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .of-loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .of-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid #d1d5db;
    border-top-color: #0E76A8;
    border-radius: 50%;
    animation: of-spin 0.6s linear infinite;
  }

  @keyframes of-spin {
    to { transform: rotate(360deg); }
  }

  .of-success {
    max-width: 480px;
    padding: 1.5rem;
    border: 1px solid #a7f3d0;
    border-radius: 6px;
    background: #ecfdf5;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .of-check-icon {
    width: 2.5rem;
    height: 2.5rem;
    margin: 0 auto 0.75rem;
    color: #10b981;
  }

  .of-success-title {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #065f46;
  }

  .of-success-text {
    margin: 0;
    font-size: 0.8125rem;
    color: #047857;
  }
</style>
