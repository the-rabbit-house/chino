<script>
  const IsDirection = {
    DOWN: (angle) => angle > 200 && angle < 315,
    LEFT: (angle) => angle > 90 && angle < 200,
    RIGHT: (angle) =>
      (angle > 0 && angle < 90) || (angle > 315 && angle <= 360),
  };

  import { getContext } from "svelte";
  import { writable } from "svelte/store";
  import { crossfade, scale } from "svelte/transition";
  import { tweened } from "svelte/motion";

  import * as R from "ramda";
  import ZingTouch from "zingtouch";

  import { images, image } from "../stores";

  import SearchMenu from "../components/SearchMenu.svelte";

  const { navigate } = getContext("navigator");
  const events = getContext("events");

  const [send, receive] = crossfade({
    duration: 200,
    fallback: scale,
  });

  var selectedImage = null;
  var imageRef = null;

  var previousImage = null;
  var nextImage = null;

  function handleImageChange(image) {
    const index = R.findIndex(R.equals(image))($images);

    previousImage = $images[R.max(index - 1, 0)];
    nextImage = $images[R.min(index + 1, R.length($images))];
  }

  $: handleImageChange(selectedImage);

  var region = null;
  const direction = writable(null);
  const delta = tweened(0, { duration: 50 });

  function hideImage() {
    $delta = 0;
    selectedImage = null;
  }

  $: dx =
    $direction === "RIGHT"
      ? $delta
      : $direction === "LEFT"
      ? -$delta
      : 0;
  $: dy = $direction === "DOWN" ? $delta : 0;

  function handleSwipe() {
    if ($delta > 60) {
      if ($direction === "DOWN") hideImage();
      else if ($direction === "RIGHT") {
        selectedImage = previousImage;
      } else if ($direction === "LEFT") {
        selectedImage = nextImage;
      }
    }

    $direction = null;
    $delta = 0;
  }

  function bindRegion(ref) {
    if (!ref || region) return;

    region = ZingTouch.Region(ref);

    return {
      destroy() {
        region.unbind(imageRef, "swipe");
        region.unbind(imageRef, "pan");
        window.removeEventListener("touchend", handleSwipe);

        region = null;
      },
    };
  }

  $: bindGestures(imageRef);
  function bindGestures(child) {
    if (!region || !child) return;

    region.bind(imageRef, "pan", function (event) {
      const angle = event.detail.data[0].directionFromOrigin;
      const distance = event.detail.data[0].distanceFromOrigin;

      let nextDirection = null;

      if (IsDirection.DOWN(angle)) nextDirection = "DOWN";
      else if (IsDirection.LEFT(angle)) nextDirection = "LEFT";
      else if (IsDirection.RIGHT(angle)) nextDirection = "RIGHT";

      if (nextDirection !== $direction) {
        $direction = nextDirection;
        $delta = 0;
      } else $delta = distance;
    });

    window.addEventListener("touchend", handleSwipe);
  }

  function invisible(ref) {
    setTimeout(() => {
      ref.classList.remove("invisible");
    }, 300);
  }

  function lazy(ref, image) {
    ref.src = image?.["file_url"];

    return {
      update(image) {
        ref.src = image?.["file_url"];
      },
    };
  }

  var showSearch = false;
  $: document.body.classList.toggle(
    "noscroll",
    showSearch || selectedImage !== null
  );

  var scrollY = 0;
  $: showBackButton = scrollY > window.innerHeight;
</script>

<svelte:window bind:scrollY />

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

<div
  id="images"
  class="mt-8 flex flex-row justify-center flex-wrap"
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
      in:receive={{ key: image["@id"] }}
      out:send={{ key: image["@id"] }}
    />
  {/each}
</div>

{#if selectedImage}
  <div
    class="fixed top-0 left-0"
    use:bindRegion
    in:send={{ key: selectedImage?.["@id"] }}
    out:receive={{ key: selectedImage?.["@id"] }}
  >
    <div class="relative flex flex-row w-screen h-screen">
      <img
        class="absolute w-screen h-screen object-contain bg-black"
        use:invisible
        src={previousImage?.["preview_file_url"]}
        style="transform:translate({-window.innerWidth +
          dx}px,{dy}px)"
      />
      <img
        bind:this={imageRef}
        use:lazy={selectedImage}
        class="absolute w-screen h-screen object-contain bg-black"
        src={selectedImage?.["preview_file_url"]}
        style="transform:translate({dx}px,{dy}px)"
      />
      <img
        class="absolute w-screen h-screen object-contain bg-black"
        use:invisible
        src={nextImage?.["preview_file_url"]}
        style="transform:translate({window.innerWidth +
          dx}px,{dy}px)"
      />
    </div>
  </div>
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

  #images {
    transition: 0.5s filter linear;

    img {
      width: calc(33.3vw);
      height: 20vh;
    }
  }
</style>
