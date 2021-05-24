<script>
  import { getContext } from "svelte";
  import { writable } from "svelte/store";
  import { crossfade, scale } from "svelte/transition";
  import { tweened } from "svelte/motion";

  import * as R from "ramda";
  import ZingTouch from "zingtouch";
  import SimpleBar from "simplebar";
  import "simplebar/dist/simplebar.css";

  import { images, image } from "../stores";

  import SearchMenu from "../components/SearchMenu.svelte";
  import ImageCarousel from "../components/ImageCarousel.svelte";

  const { navigate } = getContext("navigator");
  const events = getContext("events");

  var selectedImage = null;

  const [send, receive] = crossfade({
    duration: 200,
    fallback: scale,
  });

  var showSearch = false;
  $: document.body.classList.toggle(
    "noscroll",
    showSearch || selectedImage !== null
  );

  var innerWidth;
  $: isMobile = innerWidth <= 768;

  function customScrollbar(ref) {
    var bar = new SimpleBar(ref);
    images.subscribe(() => bar.recalculate());
  }

  var scrollY = 0;
  $: showBackButton = scrollY > window.innerHeight;
</script>

<svelte:window bind:scrollY bind:innerWidth />

<div class="px-6 pt-2 flex flex-row">
  <p class="flex-1 text-5xl font-light">gallery</p>
  <div
    id="search-icon"
    class="py-2 px-4 rounded-xl pointer"
    on:click={() => {
      window.scrollTo(0, 0);
      showSearch = !showSearch;
    }}
  >
    {#if showSearch}
      <i class="ri-close-line text-3xl" />
    {:else}
      <i class="ri-search-line text-3xl" />
    {/if}
  </div>
</div>

<div id="images-container" class="mt-4" use:customScrollbar>
  <div
    id="images"
    class="flex flex-rown flex-wrap justify-center md:px-5 md:justify-between"
    style={showSearch ? "filter: blur(20px)" : null}
  >
    {#each $images as image}
      <img
        class="object-cover"
        src={image["preview_file_url"]}
        alt=""
        on:click={() => {
          selectedImage = image;
        }}
        in:receive={{ key: image["id"] }}
        out:send={{ key: image["id"] }}
      />
    {/each}
  </div>
</div>

{#if isMobile && selectedImage}
  <ImageCarousel
    image={selectedImage}
    handles={[send, receive]}
    on:imagechange={(event) => {
      const image = event.detail;
      selectedImage = image;
    }}
    on:swipe={(event) => {
      const direction = event.detail;
      if (direction === "DOWN") selectedImage = null;
    }}
  />
{/if}

{#if showSearch}
  <div id="search-menu" class="fixed left-0">
    <SearchMenu
      on:searchend={() => {
        showSearch = false;
      }}
    />
  </div>
{/if}

{#if showBackButton && !showSearch && !selectedImage}
  <div
    class="fixed bottom-0 right-0 mr-8 mb-7 px-6 py-5 bg-white rounded-lg"
    on:click={() => {
      scrollY = 0;
    }}
  >
    <i class="ri-arrow-up-line text-2xl text-black" />
  </div>
{/if}

<style>
  #search-icon {
    background-color: rgba(0, 0, 0, 0.5);
  }

  #search-menu {
    top: 6rem;
    height: calc(100vh - 6rem);
  }

  #images-container {
    max-height: calc(100vh - 7rem);
    overflow-y: auto;
    overflow-x: hidden;
  }

  #images {
    flex: 1;
    transition: 0.5s filter linear;

    img {
      width: calc(33.3vw);
      height: 20vh;
    }
  }

  @screen md {
    #images {
      @apply space-y-2;
      @apply space-x-1;

      img {
        @apply rounded-lg;

        width: 14rem;
        height: 20rem;

        &:first-child {
          @apply ml-1;
          @apply mt-2;
        }
      }
    }
  }
</style>
