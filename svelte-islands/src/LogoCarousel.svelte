<script>
  import { onMount } from 'svelte';

  let { words = [] } = $props();
  let displayText = $state('');
  let typing = $state(false);
  let showCursor = $state(true);

  const TYPE_SPEED = 80;
  const ERASE_SPEED = 50;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function typeWord(word) {
    typing = true;
    for (let i = 0; i <= word.length; i++) {
      displayText = word.slice(0, i);
      await sleep(TYPE_SPEED);
    }
    typing = false;
  }

  async function eraseWord(word) {
    typing = true;
    for (let i = word.length; i >= 0; i--) {
      displayText = word.slice(0, i);
      await sleep(ERASE_SPEED);
    }
    typing = false;
  }

  async function loop() {
    while (true) {
      for (const entry of words) {
        await typeWord(entry.word);
        await sleep(entry.seconds * 1000);
        await eraseWord(entry.word);
        await sleep(300);
      }
    }
  }

  onMount(() => {
    if (words.length > 0) {
      loop();
    }

    const cursorInterval = setInterval(() => {
      showCursor = !showCursor;
    }, 530);

    return () => clearInterval(cursorInterval);
  });
</script>

<span class="typewriter-text">{displayText}</span>{#if typing}<span class="typewriter-cursor" class:visible={showCursor}>|</span>{/if}
