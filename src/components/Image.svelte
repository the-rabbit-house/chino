<script context="module">
  import { Http } from "@capacitor-community/http";

  async function loadFullImage(image) {
    const response = await Http.downloadFile({
      url: image?.["file_url"],
      filePath: image?.["id"],
    });

    return URL.createObjectURL(response.blob);
  }

  export function remote(ref, image) {
    if (image) {
      loadFullImage(image).then((url) => {
        ref.src = url;
      });
    }

    return {
      update(image) {
        if (image) {
          loadFullImage(image).then((url) => {
            ref.src = url;
          });
        }
      },
    };
  }
</script>
