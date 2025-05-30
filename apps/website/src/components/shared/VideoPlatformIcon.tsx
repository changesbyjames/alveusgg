import type { videoPlatformConfigs } from "@/utils/video-urls";

import IconImgur from "@/icons/IconImgur";
import IconStreamable from "@/icons/IconStreamable";
import IconVideoCamera from "@/icons/IconVideoCamera";
import IconYouTube from "@/icons/IconYouTube";

export function VideoPlatformIcon({
  platform,
  alt = "",
  ...props
}: {
  platform: keyof typeof videoPlatformConfigs | undefined;
  className?: string;
  alt?: string;
}) {
  switch (platform) {
    case "youtube":
      return <IconYouTube alt={alt} {...props} />;
    case "streamable":
      return <IconStreamable alt={alt} {...props} />;
    case "imgur":
    case "imgurGallery":
      return <IconImgur alt={alt} {...props} />;
    default:
      return <IconVideoCamera {...props} />;
  }
}
