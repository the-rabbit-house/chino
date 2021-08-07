export declare interface Image {
  id: string,
  file_name: string,
  file_ext: string,
  source: string,
  artist: string,
  thumbnail_url: string,
  file_url: string,
  sample_url: string,
  width: number,
  height: number,
  tags: Array<string>,
  video: boolean
  data: any,
}

type SearchProps = {
  page: string,
  limit: number
}

type Platform = "web" | "native";

export declare interface Backend {
  NAME: string,
  PLATFORMS: Array<Platform>,

  fetchImages(tags: string, { page, limit }: SearchProps): Promise<[boolean, Array<Image>]>,
  fetchTags(tags: string): Promise<[boolean, Array<string>]>
}

export declare const BACKENDS: Record<string, Backend>;