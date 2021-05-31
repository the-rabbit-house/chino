<script context="module">
  const CROSSFADE_TIME = 200;

  const IMAGE_SIZES = {
    SMALL: { width: "12rem", height: "16rem" },
    BASE: { width: "14rem", height: "20rem" },
    LARGE: { width: "16rem", height: "24rem" },
  };

  // Last scroll position in case navigating back from image
  export const lastScrollY = writable(0);
</script>

<script>
  import { getContext } from "svelte";
  import { writable } from "svelte/store";
  import { crossfade, scale } from "svelte/transition";

  import { settings, images, image } from "@Stores";
  import { requestMoreImages } from "@Stores/images";

  import { remote } from "@Components/Image.svelte";

  import SettingsMenu, {
    OUT_FADE_DURATION as SETTINGS_FADE_OUT,
  } from "@Components/GalleryView/SettingsMenu.svelte";
  import SearchMenu, {
    OUT_FADE_DURATION as SEARCH_FADE_OUT,
  } from "@Components/GalleryView/SearchMenu.svelte";
  import ImageCarousel from "@Components/ImageView/ImageCarousel.svelte";

  import * as R from "ramda";
  import SimpleBar from "simplebar";

  const { navigate } = getContext("navigator");

  var exiting = false;

  var innerHeight;
  var innerWidth;

  $: isMobile = innerWidth <= 768;
  $: mobileCols = $settings?.galleryCols;

  $: imageWidth = isMobile
    ? (1 / mobileCols) * 100 + "vw"
    : IMAGE_SIZES[$settings?.galleryImageSize].width;
  $: imageHeight = isMobile
    ? Math.max(20, 20 * (4 / mobileCols)) + "vh"
    : IMAGE_SIZES[$settings?.galleryImageSize].height;

  var scrollbar;
  var scrollY = 0;

  var selectedImage = $image;
  $: $image = selectedImage;

  var showImages = true;
  var showSettings = false;
  var showSearch = false;

  $: showBackButton = scrollY > innerHeight;
  $: document.body.classList.toggle(
    "noscroll",
    showSearch || selectedImage !== null
  );

  // Crossfade images when opening / loading / closing
  const [send, receive] = crossfade({
    duration: CROSSFADE_TIME,
    fallback: scale,
  });

  function openImage(image) {
    selectedImage = image;

    // Wait for crossfade to end
    if (!isMobile) {
      showImages = false;
      setTimeout(() => navigate("Image"), CROSSFADE_TIME + 10);
    }
  }

  function toggleSettings() {
    showSearch = false;
    setTimeout(() => {
      showSettings = !showSettings;
    }, SETTINGS_FADE_OUT);
  }

  function toggleSearch() {
    window.scrollTo(0, 0);

    showSettings = false;
    setTimeout(() => {
      showSearch = !showSearch;
    }, SETTINGS_FADE_OUT);
  }

  async function back() {
    if (exiting) return;

    exiting = true;
    $images = [];

    showSettings = false;
    showSearch = false;

    // Let the images crossfade and settings/search disappear
    const DELAY_TIME = Math.max(
      CROSSFADE_TIME,
      showSettings ? CROSSFADE_TIME + SETTINGS_FADE_OUT : 0,
      showSearch ? CROSSFADE_TIME + SEARCH_FADE_OUT : 0
    );

    setTimeout(() => navigate("Start"), DELAY_TIME + 10);
  }

  // Custom scrollbar needs to recalculate when images change
  function customScrollbar(ref) {
    scrollbar = new SimpleBar(ref);

    scrollbar.getScrollElement().scrollTop = $lastScrollY;

    scrollbar
      .getScrollElement()
      .addEventListener("scroll", (event) => {
        scrollY = scrollbar.getScrollElement().scrollTop;
        $lastScrollY = scrollY;
      });

    images.subscribe(() => scrollbar.recalculate());
  }

  function handleShortcuts(event) {
    const key = event.key;

    if (key === "Escape") {
      if (showSearch) showSearch = false;
      else back();
    }

    if (key === "F" || key === "f") showSearch = true;
  }
</script>

<svelte:window
  bind:innerWidth
  bind:innerHeight
  on:keyup={handleShortcuts}
/>

<nav class="flex flex-row items-center">
  <button class="flex flex-row items-center" on:click={back}>
    <i class="ri-arrow-left-s-line text-5xl md:text-6xl" />
    <p class="hidden md:block text-4xl font-light md:text-5xl">
      gallery
    </p>
  </button>
  <div class="flex-1" />
  <div id="settings-icon" class="mr-3" on:click={toggleSettings}>
    {#if showSettings}
      <i class="ri-close-line text-3xl" />
    {:else}
      <i class="ri-settings-2-line text-3xl" />
    {/if}
  </div>
  <div id="search-icon" on:click={toggleSearch}>
    {#if showSearch}
      <i class="ri-close-line text-3xl" />
    {:else}
      <i class="ri-search-line text-3xl" />
    {/if}
  </div>
</nav>

{#if showImages}
  <div
    id="images-container"
    class="flex-1 flex flex-col items-stretch"
    use:customScrollbar
  >
    <div
      id="images"
      class="flex flex-row flex-wrap justify-center md:justify-between"
      style={showSearch || showSettings
        ? "filter: blur(20px)"
        : null}
    >
      {#each $images as image}
        <img
          use:remote={[image, false]}
          class="object-cover"
          alt=""
          on:click={() => openImage(image)}
          in:receive={{ key: image["id"] }}
          out:send={{ key: image["id"] }}
          style={`width:${imageWidth}; height:${imageHeight}`}
        />
      {/each}

      {#if R.length($images) > 29}
        <button
          id="more-button"
          class="mb-2"
          on:click={requestMoreImages}
        >
          More
        </button>
      {/if}
    </div>
  </div>
{/if}

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

{#if showSettings}
  <div id="settings-menu">
    <SettingsMenu />
  </div>
{/if}

{#if showSearch}
  <div id="search-menu">
    <SearchMenu
      on:searchend={() => {
        showSearch = false;
        scrollbar.recalculate();
      }}
    />
  </div>
{/if}

{#if showBackButton && !showSearch && !selectedImage}
  <button
    id="back-button"
    on:click={() => {
      scrollbar.getScrollElement().scrollTo(0, 0);
    }}
  >
    <i class="ri-arrow-up-line text-2xl text-black" />
  </button>
{/if}

<style lang="scss">
  nav {
    @apply px-6 pt-2 h-20;
  }

  #settings-icon,
  #search-icon {
    @apply py-2 px-4 rounded-xl cursor-pointer;
    background-color: rgba(0, 0, 0, 0.5);
  }

  #settings-menu,
  #search-menu {
    @apply fixed left-0;

    top: 6rem;
    height: calc(100vh - 6rem);
  }

  #images-container {
    @apply mt-4 overflow-x-hidden overflow-y-auto;

    max-height: calc(100vh - 6.5rem);
  }

  #images {
    @apply flex-1 pb-2;
    transition: 0.5s filter linear;

    @screen md {
      @apply space-x-1 space-y-2 px-5;

      & > img {
        @apply rounded-lg;

        &:first-child {
          @apply ml-1 mt-2;
        }
      }
    }
  }

  #back-button {
    @apply fixed bottom-0 right-0;
    @apply mr-8 mb-7 px-6 py-5;
    @apply bg-white rounded-lg;
  }

  #more-button {
    @apply w-full mx-4 mt-3 py-2 text-3xl rounded-lg;

    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
