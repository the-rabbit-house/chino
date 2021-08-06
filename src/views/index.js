import StartView from "./StartView.svelte";
import GalleryView from "./GalleryView.svelte";
import ImageView from "./ImageView.svelte";
import BackendsView from "./BackendsView.svelte";
import BookmarksView from "./BookmarksView.svelte";

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
  Backends: {
    NAME: "Backends",
    COMPONENT: BackendsView,
  },
  Bookmarks: {
    NAME: "Bookmarks",
    COMPONENT: BookmarksView,
  },
};
