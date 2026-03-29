import { mount } from 'svelte';
import OptinForm from './OptinForm.svelte';

const target = document.getElementById('optin-form');
if (target) {
  mount(OptinForm, { target });
}
