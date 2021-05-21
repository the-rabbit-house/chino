<script>
  import { getContext } from "svelte";

  import { slide } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";

  import logo from "../assets/logo-sm.png";
  import tippy from "../assets/tippy.png";

  const { navigate } = getContext("navigator");
  const events = getContext("events");

  function spin(node, params) {
    return {
      delay: 0,
      duration: 5000,
      easing: cubicOut,
      css: (t, u) => `transform: rotate(${t * 360}deg);`,
    };
  }

  var showTippy = false;
  setTimeout(() => {
    showTippy = true;
  }, 500);
</script>

<div class="px-6 pt-2 flex flex-row items-center">
  <p class="flex-1 text-5xl font-light">chino</p>
  <div class="p-4 flex flex-col items-center">
    <img
      class="w-24 h-24 p-1 rounded-xl"
      src={logo}
      alt="logo"
    />
  </div>
</div>
<div class="flex-1" />
{#if showTippy}
  <img
    class="self-center w-40 h-32"
    src={tippy}
    alt="tippy"
    transition:spin
  />
{:else}
  <img class="hidden" src={tippy} alt="tippy-hidden" />
{/if}
<div class="flex-1" />
<p class="text-2xl font-light text-center">
  Brewing the coffee..
</p>

<style>
</style>
