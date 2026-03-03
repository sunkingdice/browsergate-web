import { mount } from 'svelte';
import ExtensionsTable from './ExtensionsTable.svelte';

const target = document.getElementById('extensions-table');
if (target) {
  mount(ExtensionsTable, { target });
}
