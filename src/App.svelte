<script>
  import "./ui/tailwindcss.svelte";
  import "./ui/common.scss";
  import "remixicon/fonts/remixicon.css";

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

<main class="relative flex flex-col">
  <svelte:component this={$screen?.COMPONENT} />
</main>

<style>
  @import url("https://fonts.googleapis.com/css2?family=KoHo:wght@200;300;400;500&display=swap");

  :global(html) {
    background: linear-gradient(
      150deg,
      #8093da,
      #ea83db,
      #e5ac6f
    );
  }

  :global(body) {
    min-height: 100vh;

    overscroll-behavior-y: contain;

    font-family: "KoHo", sans-serif;
    color: white;
  }

  main {
    height: 100vh;

    @apply pt-2;
    @apply pb-6;
  }
</style>
