import { mount } from 'svelte';
import LogoCarousel from './LogoCarousel.svelte';

const target = document.getElementById('logo-typewriter');
if (target) {
  const words = JSON.parse(target.dataset.words || '[]');
  target.textContent = '';
  mount(LogoCarousel, { target, props: { words } });
}
