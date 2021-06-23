<script>
  import "./ui/tailwindcss.svelte";
  import "./ui/common.scss";
  import "remixicon/fonts/remixicon.css";
  import "simplebar/dist/simplebar.css";

  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  import * as Events from "@Events";
  import Screens from "@Views";

  import {
    init as initNavigator,
    navigate,
    screen,
    screenEvents,
  } from "@Stores/navigator";
  import "@Stores/images";
  import "@Stores/favorites";

  initNavigator(Events, Screens);

  const innerWidth = writable(0);
  const innerHeight = writable(0);
  const isMobile = writable(false);

  $: $isMobile = $innerWidth < 768;

  setContext("window", {
    width: innerWidth,
    height: innerHeight,
    isMobile,
  });
  setContext("navigator", { navigate });
  setContext("events", screenEvents);

  navigate("Start");
</script>

<svelte:window
  bind:innerWidth={$innerWidth}
  bind:innerHeight={$innerHeight}
/>

<main class="relative flex flex-col">
  <svelte:component this={$screen?.COMPONENT} />
</main>

<style>
  @import url("https://fonts.googleapis.com/css2?family=KoHo:wght@200;300;400;500&display=swap");

  :global(html) {
    /* Android keyboard background */
    background-color: rgba(0, 0, 0, 0.8);
    overscroll-behavior: none;
  }

  :global(body),
  :global(#app),
  main {
    background: linear-gradient(
      150deg,
      #8093da,
      #ea83db,
      #e5ac6f
    );

    overscroll-behavior: none;
  }

  :global(body) {
    min-height: 100vh;

    font-family: "KoHo", sans-serif;
    color: white;

    @media screen and (min-width: 320px) {
      font-size: calc(16px + 6 * ((100vw - 300px) / 680));
    }

    @media screen and (min-width: 1000px) {
      font-size: 22px;
    }
  }

  main {
    @apply pt-2 h-screen;
  }
</style>
