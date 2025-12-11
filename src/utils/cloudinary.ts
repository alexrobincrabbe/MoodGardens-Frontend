import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { format, quality, dpr } from "@cloudinary/url-gen/actions/delivery";
import { Flag } from "@cloudinary/url-gen/qualifiers/flag";

export const cld = new Cloudinary({
  cloud: { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME! },
});

export const gardenLarge = (publicId: string, version?: number | null) => {
  const img = cld
    .image(publicId)
    .resize(fill().width(1600).height(1600).gravity(autoGravity()))
    .delivery(format("auto"))
    .delivery(quality("auto"))
    .delivery(dpr("auto"));

  if (version != null) {
    img.setVersion(version); // 👈 important: change URL when version changes
  }

  return img;
};
// utils/cloudinary.ts
export const gardenThumb = (publicId: string, version?: number) => {
  const img = cld
    .image(publicId)
    .resize(fill().width(1024).height(1024).gravity(autoGravity()))
    .delivery(format("auto"))
    .delivery(quality("auto"))
    .delivery(dpr("auto"));

  if (version != null) {
    img.setVersion(version); // 👈 from @cloudinary/url-gen
  }

  return img;
};

export const gardenDownloadUrl = (
  publicId: string,
  filename: string = "mood-garden.png",
  version?: number | null,
) => {
  const img = cld
    .image(publicId)
    .delivery(format("png"))
    .delivery(quality("auto:best"))
    .addFlag(Flag.attachment(filename));

  if (version != null) {
    img.setVersion(version);
  }

  return img.toURL();
};

export const gardenShareUrl = (publicId: string, version?: number | null) => {
  const img = cld
    .image(publicId)
    .resize(fill().width(1200).height(630).gravity(autoGravity()))
    .delivery(format("auto"))
    .delivery(quality("auto"));

  if (version != null) {
    img.setVersion(version);
  }

  return img.toURL();
};
