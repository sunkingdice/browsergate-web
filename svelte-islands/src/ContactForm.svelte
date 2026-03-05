<script>
  let name = $state('');
  let email = $state('');
  let subject = $state('');
  let message = $state('');
  let website = $state('');

  let status = $state('idle');
  let errorMessage = $state('');

  const loadedAt = Date.now();

  async function handleSubmit(e) {
    e.preventDefault();
    status = 'submitting';
    errorMessage = '';

    try {
      const res = await fetch('/app/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, website, _t: loadedAt }),
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
  <div class="cf-success">
    <svg class="cf-check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h3 class="cf-success-title">Message sent</h3>
    <p class="cf-success-text">Thank you. We'll get back to you as soon as possible.</p>
  </div>
{:else}
  <form onsubmit={handleSubmit} class="cf-form">
    <div class="cf-row">
      <div class="cf-field">
        <label for="cf-name">Name</label>
        <input id="cf-name" type="text" bind:value={name} required placeholder="Jane Doe" />
      </div>

      <div class="cf-field">
        <label for="cf-email">Email</label>
        <input id="cf-email" type="email" bind:value={email} required placeholder="you@example.com" />
      </div>
    </div>

    <div class="cf-field">
      <label for="cf-subject">Subject</label>
      <input id="cf-subject" type="text" bind:value={subject} required placeholder="What is this about?" />
    </div>

    <div class="cf-field">
      <label for="cf-message">Message</label>
      <textarea id="cf-message" bind:value={message} required rows="6" placeholder="Your message…"></textarea>
    </div>

    <div class="cf-hp" aria-hidden="true">
      <label for="cf-website">Website</label>
      <input id="cf-website" type="text" bind:value={website} tabindex="-1" autocomplete="off" />
    </div>

    {#if status === 'error'}
      <div class="cf-error">{errorMessage}</div>
    {/if}

    <button type="submit" disabled={status === 'submitting'} class="cf-submit">
      {status === 'submitting' ? 'Sending…' : 'Send message'}
    </button>
  </form>
{/if}

<style>
  .cf-form {
    max-width: 540px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #333;
  }

  .cf-field {
    margin-bottom: 1rem;
  }

  .cf-field label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    font-size: 0.8125rem;
    color: #444;
  }

  .cf-field input,
  .cf-field textarea {
    display: block;
    width: 100%;
    padding: 0.5rem 0.65rem;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: inherit;
    color: #333;
    background: #fff;
    transition: border-color 0.15s;
    box-sizing: border-box;
    resize: vertical;
  }

  .cf-field input:focus,
  .cf-field textarea:focus {
    outline: none;
    border-color: #0E76A8;
    box-shadow: 0 0 0 2px rgba(14, 118, 168, 0.15);
  }

  .cf-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .cf-hp {
    position: absolute;
    left: -9999px;
    opacity: 0;
    height: 0;
    overflow: hidden;
  }

  .cf-error {
    margin-bottom: 1rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid #fca5a5;
    border-radius: 4px;
    background: #fef2f2;
    font-size: 0.8125rem;
    color: #991b1b;
  }

  .cf-submit {
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

  .cf-submit:hover {
    background: #0a5f88;
  }

  .cf-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cf-success {
    max-width: 540px;
    padding: 1.5rem;
    border: 1px solid #a7f3d0;
    border-radius: 6px;
    background: #ecfdf5;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .cf-check-icon {
    width: 2.5rem;
    height: 2.5rem;
    margin: 0 auto 0.75rem;
    color: #10b981;
  }

  .cf-success-title {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #065f46;
  }

  .cf-success-text {
    margin: 0;
    font-size: 0.8125rem;
    color: #047857;
  }
</style>
