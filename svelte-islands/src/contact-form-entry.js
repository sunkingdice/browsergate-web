import { mount } from 'svelte';
import ContactForm from './ContactForm.svelte';

const target = document.getElementById('contact-form');
if (target) {
  mount(ContactForm, { target });
}
