import type { ImageProps } from "next/image";

/** next/image blur placeholder props for a catalogue photo (when a preview was generated). */
export function blurProps(image: { blurDataUrl?: string }): Pick<ImageProps, "placeholder" | "blurDataURL"> {
  return image.blurDataUrl ? { placeholder: "blur", blurDataURL: image.blurDataUrl } : {};
}
