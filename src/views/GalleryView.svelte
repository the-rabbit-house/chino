<script context="module">
  const CROSSFADE_TIME = 200;

  // Last scroll position in case navigating back from image
  export const lastScrollY = writable(0);
</script>

<script>
  import { getContext } from "svelte";
  import { writable } from "svelte/store";
  import { crossfade, scale } from "svelte/transition";

  import { images, image } from "@Stores";
  import { requestMoreImages } from "@Stores/images";

  import { remote } from "@Components/Image.svelte";

  import SearchMenu from "@Components/GalleryView/SearchMenu.svelte";
  import ImageCarousel from "@Components/ImageView/ImageCarousel.svelte";

  import * as R from "ramda";
  import SimpleBar from "simplebar";

  const { navigate } = getContext("navigator");

  var exiting = false;

  var innerHeight;
  var innerWidth;
  $: isMobile = innerWidth <= 768;

  var scrollbar;
  var scrollY = 0;

  var selectedImage = $image;
  $: $image = selectedImage;

  var showImages = true;
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

  async function back() {
    if (exiting) return;

    exiting = true;
    $images = [];

    // Let the images crossfade before changing screen
    setTimeout(() => navigate("Start"), CROSSFADE_TIME + 10);
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
    <i class="ri-arrow-left-s-line text-4xl md:text-5xl" />
    <p class="text-4xl font-light md:text-5xl">gallery</p>
  </button>
  <div class="flex-1" />
  <div
    id="search-icon"
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
      style={showSearch ? "filter: blur(20px)" : null}
    >
      {#each $images as image}
        <img
          use:remote={[image, false]}
          class="object-cover"
          alt=""
          on:click={() => openImage(image)}
          in:receive={{ key: image["id"] }}
          out:send={{ key: image["id"] }}
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

{#if showSearch}
  <div id="search-menu">
    <SearchMenu
      on:searchend={() => {
        showSearch = false;
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

  #search-icon {
    @apply py-2 px-4 rounded-xl cursor-pointer;
    background-color: rgba(0, 0, 0, 0.5);
  }

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

    & > img {
      width: calc(33.3vw);
      height: 20vh;
    }

    @screen md {
      @apply space-x-1 space-y-2 px-5;

      & > img {
        @apply rounded-lg;

        width: 14rem;
        height: 20rem;

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
