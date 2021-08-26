<script>
  import { getContext, createEventDispatcher } from "svelte";
  import * as R from "ramda";

  const { currentScreen } = getContext("navigator");

  export let title = R.toLower($currentScreen.NAME);

  const dispatch = createEventDispatcher();
  const back = () => dispatch("back");
</script>

<nav class="flex flex-row">
  <slot name="left">
    <button
      class="flex-1 flex flex-row items-center"
      on:click={back}
    >
      <i id="arrow-button" class="ri-arrow-left-s-line" />
      <p id="screen-name">
        {title}
      </p>
    </button>
  </slot>
  <slot name="right" />
</nav>

<style lang="scss">
  nav {
    @apply px-2 pt-2 h-20;
  }

  #arrow-button {
    @apply text-4xl;

    @screen md {
      @apply text-5xl;
    }
  }

  #screen-name {
    @apply text-4xl font-light;

    @screen md {
      @apply text-5xl;
    }
  }
</style>
