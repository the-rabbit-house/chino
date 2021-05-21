<script>
  import "./ui/tailwindcss.svelte";

  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  import * as Events from "./events";
  import Screens from "./views";

  import {
    init as initNavigator,
    navigate as _navigate,
    screen,
    screenEvents,
  } from "./stores/navigator";

  function navigate(screen, reset) {
    _navigate(screen, reset);
  }

  initNavigator(Events, Screens);

  setContext("navigator", { navigate });
  setContext("events", screenEvents);

  _navigate("Start");
</script>

<main class="flex flex-col">
  <svelte:component this={$screen?.COMPONENT} />
</main>

<style lang="postcss">
  @import url("https://fonts.googleapis.com/css2?family=KoHo:wght@200;300;400;500&display=swap");

  :global(html) {
    background: #396afc; /* fallback for old browsers */
    background: -webkit-linear-gradient(
      to right,
      #2948ff,
      #396afc
    ); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(
      to right,
      #2948ff,
      #396afc
    ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  }

  :global(body) {
    min-height: 100vh;

    font-family: "KoHo", sans-serif;
    color: white;
  }

  main {
    height: 100vh;

    @apply pt-2 pb-6;
  }
</style>
