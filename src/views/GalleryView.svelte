<script context="module">
  const CROSSFADE_TIME = 200;

  // Last scroll position in case navigating back from image
  export const lastScrollY = writable(0);
</script>

<script>
  import { getContext, tick } from "svelte";
  import { writable } from "svelte/store";
  import { fade } from "svelte/transition";

  import { tags, images, image, favorites } from "@Stores";
  import {
    fetching,
    hasNextPage,
    requestImages,
    requestMoreImages,
  } from "@Stores/images";

  import { SETTINGS, remToPx, sleep } from "@Utils";

  import Navbar from "@Components/Navbar.svelte";

  import Images from "@Components/GalleryView/Images.svelte";

  import SettingsMenu, {
    OUT_FADE_DURATION as SETTINGS_FADE_OUT,
  } from "@Components/GalleryView/SettingsMenu.svelte";
  import SearchMenu, {
    IN_FADE_DELAY as SEARCH_FADE_IN,
    OUT_FADE_DURATION as SEARCH_FADE_OUT,
  } from "@Components/GalleryView/SearchMenu.svelte";

  import ImageCarousel from "@Components/ImageView/ImageCarousel.svelte";

  import * as R from "ramda";
  import SimpleBar from "simplebar";

  const { images: favoriteImages } = favorites;

  const { height, isMobile } = getContext("screen");
  const { navigate: _navigate } = getContext("navigator");

  const backend = SETTINGS.get("backend");

  var exiting = false;

  var scrollbar = null;
  var scrollY = 0;

  var selectedImage = $image;
  $: $image = selectedImage;

  var showMoreButton = false;

  var showImages = true;
  var showSettings = false;
  var showSearch = false;

  $: showBackButton = scrollY > $height;
  $: document.body.classList.toggle(
    "noscroll",
    showSearch || selectedImage !== null
  );

  function navigate(screen) {
    const waitExtra =
      showImages ||
      showSearch ||
      showSettings ||
      R.length($images) > 0;

    showImages = false;
    showSearch = false;
    showSettings = false;

    setTimeout(
      () => _navigate(screen),
      CROSSFADE_TIME + (waitExtra ? 300 : 0)
    );
  }

  function openImage(image) {
    selectedImage = image;

    // Wait for crossfade to end
    if (!$isMobile) navigate("Image");
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

  async function onSearch(event) {
    const tags = event.detail;

    scrollbar.getScrollElement().scrollTop = 0;

    $images = [];

    // Wait for crossfade
    await sleep(CROSSFADE_TIME + 10);

    const success = await requestImages(tags);
    if (success) showSearch = false;
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

<Navbar>
  <section slot="left" class="flex-1 flex flex-row">
    {#if showSearch}
      <button
        id="backend-button"
        in:fade={{ delay: SEARCH_FADE_IN }}
        out:fade={{ duration: SEARCH_FADE_OUT }}
        on:click={() => navigate("Backends")}
      >
        {#if $isMobile}
          <i class="ri-gallery-line text-3xl" />
        {:else}
          {$backend}
        {/if}
      </button>
    {/if}
  </section>

  <section slot="right" class="flex flex-row space-x-2">
    <div
      id="bookmarks-icon"
      on:click={() => navigate("Bookmarks")}
    >
      <i class="ri-bookmark-line text-3xl" />
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
  </section>
</Navbar>

{#key $tags}
  <article
    class="flex-1 flex flex-col items-stretch"
    use:customScrollbar
  >
    {#if showImages}
      <Images
        blur={showSearch || showSettings}
        on:imageclick={e => openImage(e.detail)}
      />
    {/if}
  </article>
{/key}

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

{#if showMoreButton && !selectedImage && !showSearch && !showSettings && !$fetching && $hasNextPage}
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
{:else if showMoreButton && !selectedImage && !showSearch && !showSettings && !$hasNextPage && !R.isEmpty($tags)}
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

{#if showBackButton && !selectedImage && !showSearch && !showSettings}
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
  #settings-icon,
  #search-icon,
  #bookmarks-icon {
    @apply px-4 rounded-xl cursor-pointer;
    @apply flex flex-row items-center;

    height: 85%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  #backend-button {
    @apply px-4 md:px-24 rounded-lg;
    @apply text-sm truncate;

    height: 85%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  #settings-menu,
  #search-menu {
    @apply fixed left-0;

    top: 6rem;
    height: calc(100vh - 6rem);
  }

  article {
    @apply mt-4 overflow-x-hidden overflow-y-auto;

    max-height: calc(100vh - 6.5rem);
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
