<script context="module">
  const CROSSFADE_TIME = 200;

  const IMAGE_SIZES = {
    SMALL: { width: "12rem", height: "16rem" },
    BASE: { width: "14rem", height: "20rem" },
    LARGE: { width: "16rem", height: "24rem" },
  };

  const imageSizeOrDefault = size =>
    R.defaultTo(
      IMAGE_SIZES["BASE"],
      size ? IMAGE_SIZES[size] : null
    );

  function remToPx(rem) {
    return (
      rem *
      parseFloat(
        getComputedStyle(document.documentElement).fontSize
      )
    );
  }

  // Last scroll position in case navigating back from image
  export const lastScrollY = writable(0);
</script>

<script>
  import { getContext, tick } from "svelte";
  import { writable } from "svelte/store";
  import { crossfade, fade, scale } from "svelte/transition";

  import { tags, images, image, favorites } from "@Stores";
  import {
    fetching,
    hasNextPage,
    requestImages,
    requestMoreImages,
  } from "@Stores/images";

  import { SETTINGS } from "@Utils";

  import {
    remote,
    getImage,
    getThumbnail,
  } from "@Components/Image.svelte";

  import SettingsMenu, {
    OUT_FADE_DURATION as SETTINGS_FADE_OUT,
  } from "@Components/GalleryView/SettingsMenu.svelte";
  import SearchMenu, {
    IN_FADE_DELAY as SEARCH_FADE_IN,
    OUT_FADE_DURATION as SEARCH_FADE_OUT,
  } from "@Components/GalleryView/SearchMenu.svelte";
  import BackendsMenu from "@Components/GalleryView/BackendsMenu.svelte";
  import ImageCarousel from "@Components/ImageView/ImageCarousel.svelte";

  import * as R from "ramda";
  import SimpleBar from "simplebar";

  const { images: favoriteImages } = favorites;

  const { navigate } = getContext("navigator");

  var exiting = false;

  const backend = SETTINGS.get("backend");

  const { height: windowHeight, isMobile } =
    getContext("window");

  const mobileCols = SETTINGS.get("galleryCols");
  const imageSize = SETTINGS.get("galleryImageSize");

  $: imageWidth = $isMobile
    ? (1 / $mobileCols) * 100 + "vw"
    : imageSizeOrDefault($imageSize).width;
  $: imageHeight = $isMobile
    ? Math.max(20, 20 * (4 / $mobileCols)) + "vh"
    : imageSizeOrDefault($imageSize).height;

  var scrollbar;
  var scrollY = 0;

  var selectedImage = $image;
  $: $image = selectedImage;

  var showMoreButton = false;

  var showImages = true;
  var showSettings = false;
  var showSearch = false;
  var showBackends = false;

  $: showBackButton = scrollY > $windowHeight;
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
    if (!$isMobile) {
      showImages = false;
      setTimeout(() => navigate("Image"), CROSSFADE_TIME + 10);
    }
  }

  function showFavorites() {
    $tags = [];
    $images = $favoriteImages;

    $hasNextPage = false;
  }

  function toggleSettings() {
    showBackends = false;
    showSearch = false;
    setTimeout(() => {
      showSettings = !showSettings;
    }, SETTINGS_FADE_OUT);
  }

  function toggleSearch() {
    window.scrollTo(0, 0);

    showBackends = false;
    showSettings = false;
    setTimeout(() => {
      showSearch = !showSearch;
    }, SETTINGS_FADE_OUT);
  }

  function toggleBackends() {
    if (!showBackends) {
      showSearch = false;
      setTimeout(() => {
        showBackends = true;
      }, SEARCH_FADE_OUT);
    } else {
      showBackends = false;
      showSearch = true;
    }
  }

  async function onSearch(event) {
    const tags = event.detail;

    scrollbar.getScrollElement().scrollTo(0, 0);

    $images = [];

    // Wait for crossfade
    await new Promise(resolve =>
      setTimeout(resolve, CROSSFADE_TIME + 10)
    );

    const success = await requestImages(tags);
    if (success) showSearch = false;
  }

  function onBackendChange(event) {
    SETTINGS.set("backend", event?.detail);

    showBackends = false;
    showSearch = true;
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

    function handleScroll() {
      scrollY = scrollbar.getScrollElement().scrollTop;

      const scrollHeight =
        scrollbar.getScrollElement().scrollHeight;

      const scrollDepth = Math.abs(
        window.innerHeight -
          remToPx(6.5) +
          scrollY -
          scrollHeight
      );

      if (scrollDepth < remToPx(6)) showMoreButton = true;
      else if (
        scrollHeight > 0 &&
        scrollHeight < window.innerHeight
      )
        showMoreButton = true;
      else showMoreButton = false;

      $lastScrollY = scrollY;
    }

    scrollbar
      .getScrollElement()
      .addEventListener("scroll", handleScroll);

    images.subscribe(async () => {
      scrollbar.recalculate();

      await tick();
      handleScroll();
    });
  }

  function handleShortcuts(event) {
    const key = event.key;

    if (key === "Escape") {
      if (showSearch) showSearch = false;
      if (showSettings) showSettings = false;
      else back();
    }
  }
</script>

<svelte:window on:keyup={handleShortcuts} />

<nav class="flex flex-row items-center space-x-4">
  {#if showSearch}
    <button
      in:fade={{ delay: SEARCH_FADE_IN }}
      out:fade={{ duration: SEARCH_FADE_OUT }}
      id="backend-button"
      on:click={toggleBackends}
    >
      {#if $isMobile}
        <i class="ri-gallery-line text-3xl" />
      {:else}
        {$backend}
      {/if}
    </button>
  {/if}

  <div class="flex-1" />
  <div id="favorites-icon" on:click={showFavorites}>
    <i class="ri-star-line text-3xl" />
  </div>
  <div id="settings-icon" on:click={toggleSettings}>
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
      style={showSearch || showSettings || showBackends
        ? "filter: blur(20px)"
        : null}
    >
      {#each $images as image}
        <img
          use:remote={[image, false]}
          class="object-cover"
          alt=""
          src={getThumbnail(image)}
          on:click={() => openImage(image)}
          in:receive={{ key: image["id"] }}
          out:send={{ key: image["id"] }}
          style={`width:${imageWidth}; height:${imageHeight}`}
        />
      {/each}
    </div>
  </div>
{/if}

{#if $isMobile && selectedImage}
  <ImageCarousel
    image={selectedImage}
    on:imagechange={event => {
      const image = event.detail;
      selectedImage = image;
    }}
    on:swipe={event => {
      const direction = event.detail;
      if (direction === "DOWN") selectedImage = null;
    }}
  />
{/if}

{#if showMoreButton && !selectedImage && !showSearch && !showSettings && !showBackends && !$fetching && $hasNextPage}
  <button
    id="more-button"
    class="mb-2"
    on:click={() => {
      showMoreButton = false;
      requestMoreImages();
    }}
  >
    More
  </button>
{:else if showMoreButton && !selectedImage && !showSearch && !showSettings && !showBackends && !$hasNextPage}
  <p class="text-3xl text-center pb-2">No more images...</p>
{/if}

{#if showSettings}
  <div id="settings-menu">
    <SettingsMenu />
  </div>
{/if}

{#if showSearch}
  <div id="search-menu">
    <SearchMenu on:search={onSearch} />
  </div>
{/if}

{#if showBackends}
  <div id="backends-menu">
    <BackendsMenu on:backendchange={onBackendChange} />
  </div>
{/if}

{#if showBackButton && !selectedImage && !showSearch && !showSettings && !showBackends}
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
    @apply px-4 pt-2 h-20;
  }

  #settings-icon,
  #search-icon,
  #favorites-icon {
    @apply px-4 rounded-xl cursor-pointer;
    @apply flex flex-row items-center;
    height: 85%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  #backend-button {
    @apply px-4 md:px-24 rounded-lg truncate text-sm;
    height: 85%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  #settings-menu,
  #search-menu,
  #backends-menu {
    @apply fixed left-0;

    top: 6rem;
    height: calc(100vh - 6rem);
  }

  #images-container {
    @apply mt-4 overflow-x-hidden overflow-y-auto;

    max-height: calc(100vh - 6.5rem);
  }

  #images {
    @apply flex-1 pb-24;
    transition: 0.5s filter linear;

    @screen md {
      @apply space-x-1 space-y-2 px-5;

      & > img {
        @apply rounded-lg;
        background-color: rgba(0, 0, 0, 0.3);

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
    @apply fixed w-full py-2 text-3xl rounded-lg;

    width: 75%;

    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);

    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
