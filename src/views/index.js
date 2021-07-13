import StartView from "./StartView.svelte";
import GalleryView from "./GalleryView.svelte";
import ImageView from "./ImageView.svelte";

export default {
  Start: {
    NAME: "Start",
    COMPONENT: StartView,
  },
  Gallery: {
    NAME: "Gallery",
    COMPONENT: GalleryView,
  },
  Image: {
    NAME: "Image",
    COMPONENT: ImageView,
  },
};
