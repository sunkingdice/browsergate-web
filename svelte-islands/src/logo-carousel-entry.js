import { mount } from 'svelte';
import LogoCarousel from './LogoCarousel.svelte';

const target = document.getElementById('logo-carousel');
if (target) {
  mount(LogoCarousel, { target });
}
