import { mount } from 'svelte';
import SignupForm from './SignupForm.svelte';

const target = document.getElementById('signup-form');
if (target) {
  mount(SignupForm, { target });
}
