<script>
  import { onMount } from 'svelte';

  let extensions = $state([]);
  let filtered = $state([]);
  let search = $state('');
  let categoryFilter = $state('');
  let sortCol = $state('name');
  let sortAsc = $state(true);
  let categories = $state([]);
  let loaded = $state(false);
  let page = $state(0);
  const PAGE_SIZE = 50;

  onMount(async () => {
    const res = await fetch('/data/extensions.json');
    extensions = await res.json();
    const catSet = new Set(extensions.map(e => e.category).filter(Boolean));
    categories = [...catSet].sort();
    applyFilters();
    loaded = true;
  });

  function applyFilters() {
    const q = search.toLowerCase();
    let result = extensions;

    if (categoryFilter) {
      result = result.filter(e => e.category === categoryFilter);
    }

    if (q) {
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q) ||
        e.extensionId.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      let va = a[sortCol] || '';
      let vb = b[sortCol] || '';
      if (sortCol === 'lastUpdate') {
        va = va || '0000-00-00';
        vb = vb || '0000-00-00';
      }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });

    filtered = result;
    page = 0;
  }

  function toggleSort(col) {
    if (sortCol === col) {
      sortAsc = !sortAsc;
    } else {
      sortCol = col;
      sortAsc = true;
    }
    applyFilters();
  }

  function sortIndicator(col) {
    if (sortCol !== col) return '';
    return sortAsc ? ' ▲' : ' ▼';
  }

  function handleSearch(e) {
    search = e.target.value;
    applyFilters();
  }

  function handleCategory(e) {
    categoryFilter = e.target.value;
    applyFilters();
  }

  function copyId(id) {
    navigator.clipboard.writeText(id);
  }

  $effect(() => {
    // reactivity placeholder
    search; categoryFilter; sortCol; sortAsc;
  });

  let paged = $derived(filtered.slice(0, (page + 1) * PAGE_SIZE));
  let hasMore = $derived(paged.length < filtered.length);
</script>

{#if !loaded}
  <div class="ext-loading">Loading extensions database…</div>
{:else}
  <div class="ext-controls">
    <div class="ext-search-wrap">
      <svg class="ext-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        class="ext-search"
        placeholder="Search {extensions.length.toLocaleString()} extensions…"
        oninput={handleSearch}
        value={search}
      />
    </div>
    <select class="ext-category" onchange={handleCategory} value={categoryFilter}>
      <option value="">All categories</option>
      {#each categories as cat}
        <option value={cat}>{cat}</option>
      {/each}
    </select>
    <span class="ext-count">{filtered.length.toLocaleString()} result{filtered.length === 1 ? '' : 's'}</span>
  </div>

  <div class="ext-table-wrap">
    <table class="ext-table">
      <thead>
        <tr>
          <th class="col-name" onclick={() => toggleSort('name')}>Name{sortIndicator('name')}</th>
          <th class="col-cat" onclick={() => toggleSort('category')}>Category{sortIndicator('category')}</th>
          <th class="col-desc">Description</th>
          <th class="col-country" onclick={() => toggleSort('country')}>Country{sortIndicator('country')}</th>
          <th class="col-date" onclick={() => toggleSort('lastUpdate')}>Updated{sortIndicator('lastUpdate')}</th>
          <th class="col-links">Links</th>
        </tr>
      </thead>
      <tbody>
        {#each paged as ext}
          <tr>
            <td class="col-name">{ext.name}</td>
            <td class="col-cat"><span class="ext-cat-badge">{ext.category || '—'}</span></td>
            <td class="col-desc">{ext.description}</td>
            <td class="col-country">{ext.country || '—'}</td>
            <td class="col-date">{ext.lastUpdate || '—'}</td>
            <td class="col-links">
              <div class="ext-links">
                {#if ext.storeUrl}
                  <a href={ext.storeUrl} target="_blank" rel="noopener" title="Chrome Web Store">
                    <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="21" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="1.5"/><line x1="6.5" y1="2.5" x2="9.5" y2="8" stroke="currentColor" stroke-width="1.5"/><line x1="6.5" y1="21.5" x2="9.5" y2="16" stroke="currentColor" stroke-width="1.5"/></svg>
                  </a>
                {/if}
                {#if ext.website}
                  <a href={ext.website} target="_blank" rel="noopener" title="Website">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                {/if}
                {#if ext.extensionId}
                  <button class="ext-id-btn" onclick={() => copyId(ext.extensionId)} title="Copy Extension ID: {ext.extensionId}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                {/if}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if hasMore}
    <button class="ext-load-more" onclick={() => page++}>
      Show more ({filtered.length - paged.length} remaining)
    </button>
  {/if}
{/if}

<style>
  .ext-loading {
    padding: 3rem 0;
    text-align: center;
    color: #717171;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
  }

  .ext-controls {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
  }

  .ext-search-wrap {
    position: relative;
    flex: 1;
    min-width: 220px;
  }

  .ext-search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: #999;
    pointer-events: none;
  }

  .ext-search {
    width: 100%;
    padding: 0.6rem 0.75rem 0.6rem 2.25rem;
    border: 1px solid #d0d0d0;
    border-radius: 3px;
    font-size: 0.875rem;
    background: #fafafa;
    transition: border-color 0.15s, background 0.15s;
    outline: none;
  }

  .ext-search:focus {
    border-color: #0E76A8;
    background: #fff;
  }

  .ext-category {
    padding: 0.6rem 0.75rem;
    border: 1px solid #d0d0d0;
    border-radius: 3px;
    font-size: 0.875rem;
    background: #fafafa;
    cursor: pointer;
    outline: none;
  }

  .ext-category:focus {
    border-color: #0E76A8;
  }

  .ext-count {
    font-size: 0.8rem;
    color: #717171;
    white-space: nowrap;
    letter-spacing: 0.03em;
    font-variant-numeric: tabular-nums;
  }

  .ext-table-wrap {
    overflow-x: auto;
    border: 1px solid #e0e0e0;
    border-radius: 3px;
  }

  .ext-table {
    width: 100%;
    min-width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    font-size: 0.825rem;
    line-height: 1.45;
  }

  .ext-table thead {
    background: #f5f5f5;
    border-bottom: 2px solid #0E76A8;
  }

  .ext-table th {
    padding: 0.65rem 0.75rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #333;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }

  .ext-table th:hover {
    color: #0E76A8;
  }

  .col-desc {
    cursor: default !important;
  }

  .col-links {
    cursor: default !important;
  }

  .ext-table td {
    padding: 0.55rem 0.75rem;
    border-bottom: 1px solid #eee;
    vertical-align: top;
  }

  .ext-table tbody tr:hover {
    background: #f8fbfd;
  }

  .col-name {
    width: 22%;
    font-weight: 500;
    color: #1a1a1a;
  }

  .col-cat {
    width: 13%;
  }

  .ext-cat-badge {
    display: inline-block;
    padding: 0.15rem 0.45rem;
    background: #eef4f8;
    border-radius: 2px;
    font-size: 0.75rem;
    color: #0E76A8;
    white-space: nowrap;
  }

  .col-desc {
    width: 35%;
    color: #555;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .col-country {
    width: 8%;
    text-align: center;
  }

  .col-date {
    width: 10%;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    color: #666;
  }

  .col-links {
    width: 12%;
  }

  .ext-links {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .ext-links a,
  .ext-links button {
    color: #888;
    transition: color 0.15s;
    display: flex;
    align-items: center;
  }

  .ext-links a:hover,
  .ext-links button:hover {
    color: #0E76A8;
  }

  .ext-id-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
  }

  .ext-load-more {
    display: block;
    width: 100%;
    margin-top: 1rem;
    padding: 0.7rem;
    border: 1px solid #d0d0d0;
    border-radius: 3px;
    background: #fafafa;
    font-size: 0.85rem;
    color: #555;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .ext-load-more:hover {
    background: #eef4f8;
    border-color: #0E76A8;
    color: #0E76A8;
  }
</style>
