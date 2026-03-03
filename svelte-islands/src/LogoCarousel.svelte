<script>
  import { onMount } from 'svelte';

  const variants = ['uncovered', 'unhinged', 'uncontrolled', 'unauthorized'];
  let current = 0;
  let visible = true;

  onMount(() => {
    const interval = setInterval(() => {
      visible = false;
      setTimeout(() => {
        current = (current + 1) % variants.length;
        visible = true;
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  });
</script>

<div class="logo-carousel">
  <span class="logo" class:fade-in={visible} class:fade-out={!visible}>
    <span class="prefix">un</span>{variants[current].slice(2)}
  </span>
</div>

<style>
  .logo-carousel {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
  }
  .logo {
    font-size: 2.5rem;
    font-weight: bold;
    transition: opacity 0.4s ease;
  }
  .prefix {
    color: #0a66c2;
  }
  .fade-in { opacity: 1; }
  .fade-out { opacity: 0; }
</style>
