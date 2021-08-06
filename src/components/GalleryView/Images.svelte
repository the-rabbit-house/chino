<script context="module">
  export const CROSSFADE_TIME = 200;

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
</script>

<script>
  import { getContext, createEventDispatcher } from "svelte";
  import { crossfade, scale } from "svelte/transition";

  import { images } from "@Stores";

  import { SETTINGS } from "@Utils";

  import * as R from "ramda";

  const dispatch = createEventDispatcher();

  import {
    remote,
    getImage,
    getThumbnail,
  } from "@Components/Image.svelte";

  export let blur = false;

  const { isMobile } = getContext("screen");

  const mobileCols = SETTINGS.get("galleryCols");
  const imageSize = SETTINGS.get("galleryImageSize");

  $: imageWidth = $isMobile
    ? (1 / $mobileCols) * 100 + "vw"
    : imageSizeOrDefault($imageSize).width;

  $: imageHeight = $isMobile
    ? Math.max(20, 20 * (4 / $mobileCols)) + "vh"
    : imageSizeOrDefault($imageSize).height;

  const [send, receive] = crossfade({
    duration: CROSSFADE_TIME,
    fallback: scale,
  });
</script>

<div
  id="images"
  class="flex flex-row flex-wrap justify-center md:justify-between"
  style={blur ? "filter: blur(20px)" : null}
>
  {#each $images as image}
    <img
      use:remote={[image, false]}
      class="object-cover"
      alt=""
      src={getThumbnail(image)}
      on:click={() => dispatch("imageclick", image)}
      in:receive={{ key: image["id"] }}
      out:send={{ key: image["id"] }}
      style={`width:${imageWidth}; height:${imageHeight}`}
    />
  {/each}
</div>

<style lang="scss">
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
</style>
