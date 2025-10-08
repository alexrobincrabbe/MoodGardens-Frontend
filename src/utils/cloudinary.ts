// src/cloudinary.ts
import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { format, quality, dpr } from "@cloudinary/url-gen/actions/delivery";
import { Flag } from "@cloudinary/url-gen/qualifiers/flag";

export const cld = new Cloudinary({
  cloud: { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME! },
});

export const gardenLarge = (publicId: string) =>
  cld
    .image(publicId)
    .resize(fill().width(1600).height(1600).gravity(autoGravity()))
    .delivery(format("auto"))
    .delivery(quality("auto"))
    .delivery(dpr("auto"));

export const gardenThumb = (publicId: string) =>
  cld
    .image(publicId)
    .resize(fill().width(1024).height(1024).gravity(autoGravity()))
    .delivery(format("auto"))
    .delivery(quality("auto"))
    .delivery(dpr("auto"));

/** ✅ Clean download URL: ONE fl_attachment:<filename>, q_auto:best, PNG */
export const gardenDownloadUrl = (publicId: string, filename = "mood-garden.png") =>
  cld
    .image(publicId)
    .delivery(format("png"))
    .delivery(quality("auto:best"))
    .addFlag(Flag.attachment(filename)) // <-- includes the filename; no string replace needed
    .toURL();

/** Share-friendly CDN URL (use for social/copy links) */
export const gardenShareUrl = (publicId: string) =>
  cld
    .image(publicId)
    .resize(fill().width(1200).height(630).gravity(autoGravity()))
    .delivery(format("auto"))
    .delivery(quality("auto"))
    .toURL();
