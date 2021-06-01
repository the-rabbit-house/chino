<script>
  import { getContext, onMount } from "svelte";
  import { cubicOut } from "svelte/easing";

  import tippy from "@Assets/tippy.png";

  import { Device } from "@capacitor/device";

  const { navigate } = getContext("navigator");
  const events = getContext("events");

  function spin(node, params) {
    return {
      delay: 0,
      duration: 1500,
      easing: cubicOut,
      css: (t, u) => `transform: rotate(${t * 360}deg);`,
    };
  }

  var showTippy = false;

  onMount(async () => {
    showTippy = true;
    const info = await Device.getInfo();
    if (info?.operatingSystem === "android") {
      const meta = document.querySelector("meta[name=viewport]");
      meta.setAttribute(
        "content",
        `width=device-width, height=${window.innerHeight}, initial-scale=1.0`
      );
    }
    setTimeout(() => navigate("Gallery"), 1500);
  });
</script>

<nav class="px-6 pt-2 h-20 flex flex-row items-center">
  <p class="flex-1 text-5xl font-light">chino</p>
  <a href="https://github.com/the-rabbit-house/chino">
    <i class="ri-github-fill text-5xl" />
  </a>
</nav>

<div class="flex-1" />

{#if showTippy}
  <img
    class="self-center w-40 h-32"
    src={tippy}
    alt="tippy"
    in:spin
  />
{:else}
  <img class="hidden" src={tippy} alt="tippy-hidden" />
{/if}

<div class="flex-1" />

<p class="pb-6 text-2xl font-light text-center">
  Brewing the coffee..
</p>

<style>
</style>
