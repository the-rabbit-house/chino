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
  import { spring, tweened } from "svelte/motion";

  import * as R from "ramda";

  import ZingTouch from "zingtouch";

  const { navigate } = getContext("navigator");
  const events = getContext("events");

  import allPosts from "../assets/posts.json";
  const posts = allPosts.posts.post;

  const [send, receive] = crossfade({
    duration: 200,
    fallback: scale,
  });

  var selectedImage = null;
  $: selectedIndex = R.findIndex(R.equals(selectedImage))(posts);

  $: previousImage = posts[R.max(selectedIndex - 1, 0)];
  $: nextImage = posts[R.min(selectedIndex + 1, posts.length)];

  var imageRef = null;

  const direction = writable(null);
  const delta = tweened(0, { duration: 50 });

  $: dx =
    $direction === "RIGHT"
      ? $delta
      : $direction === "LEFT"
      ? -$delta
      : 0;
  $: dy = $direction === "DOWN" ? $delta : 0;

  var region = null;
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

  function hideImage() {
    $delta = 0;
    selectedImage = null;
  }

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
  id="posts"
  class="mt-8 flex flex-row justify-center flex-wrap"
  style={showSearch && "filter: blur(20px)"}
>
  {#each posts as post}
    <img
      class="object-cover"
      src={post["@preview_url"]}
      alt=""
      on:click={() => {
        selectedImage = post;
      }}
      in:receive={{ key: post["@id"] }}
      out:send={{ key: post["@id"] }}
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
        src={previousImage?.["@preview_url"]}
        style="transform:translate({-window.innerWidth +
          dx}px,{dy}px)"
      />
      <img
        bind:this={imageRef}
        class="absolute w-screen h-screen object-contain bg-black"
        src={selectedImage?.["@preview_url"]}
        style="transform:translate({dx}px,{dy}px)"
      />
      <img
        class="absolute w-screen h-screen object-contain bg-black"
        src={nextImage?.["@preview_url"]}
        style="transform:translate({window.innerWidth +
          dx}px,{dy}px)"
      />
    </div>
  </div>
{/if}

{#if showSearch}
  <div id="search-menu" class="fixed left-0">
    <div class="w-screen h-screen" />
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

<style lang="scss">
  #search-icon {
    background-color: rgba(0, 0, 0, 0.5);
  }

  #search-menu {
    top: 6rem;
  }

  #posts {
    transition: 0.5s filter linear;

    img {
      width: calc(33vw);
      height: 20vh;
    }
  }
</style>
