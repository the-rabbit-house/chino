<script context="module">
  const isSupported = (backend, platform) =>
    R.contains(platform, R.defaultTo([], backend?.PLATFORMS));
</script>

<script>
  import { onMount, createEventDispatcher } from "svelte";

  import BACKENDS from "@Stores/backends";

  import * as R from "ramda";

  import { Device } from "@capacitor/device";

  const dispatch = createEventDispatcher();

  let platform = null;

  function switchBackend(backend) {
    // TODO: alert unsupported

    dispatch("backendchange", backend);
  }

  onMount(async () => {
    const info = await Device.getInfo();
    if (info.platform === "web") platform = "web";
    else platform = "native";
  });
</script>

<main class="flex flex-col">
  <div id="backends" class="flex flex-col space-y-2">
    {#each Object.entries(BACKENDS) as [backend, _]}
      <button
        data-supported={isSupported(_, platform)}
        on:click={() => switchBackend(backend)}
      >
        <p class="absolute top-0 right-0 pt-6 pr-6">
          {isSupported(_, platform) ? "AVAILABLE" : "UNVAILABLE"}
        </p>

        <p class="pb-2 text-2xl">{backend}</p>

        <p class="text-lg">Supported platforms:</p>
        <div class="pt-1 flex flex-row space-x-4">
          <p>WEB: {isSupported(_, "web") ? "✓" : "✗"}</p>
          <p>NATIVE: {isSupported(_, "native") ? "✓" : "✗"}</p>
        </div>
      </button>
    {/each}
  </div>

  <button class="text-2xl">Help</button>
</main>

<style>
  main {
    @apply w-screen h-full px-4 pb-4;
  }

  #backends {
    @apply flex-1 overflow-y-auto;

    & > button {
      @apply relative px-4 text-left;

      &[data-supported="false"] {
        color: #ff726f;
      }
    }
  }

  button {
    @apply py-5 rounded-lg;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
