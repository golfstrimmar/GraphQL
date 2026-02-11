import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
console.log("CLD cloud_name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLD api_key:", process.env.CLOUDINARY_API_KEY);
console.log(
  "CLD api_secret exists:",
  process.env.CLOUDINARY_API_SECRET ? "YES" : "NO",
);

// // // // // // // // // // // // // // // // // //
function normalizeFileName(fileName) {
  return fileName
    .replace(/\.[^.]+$/, "") // убираем расширение
    .replace(/\s+/g, " "); // по желанию: чистим пробелы
}

export function uploadToCloudinary(file, folder = "ulon", fileName) {
  const cleanName = normalizeFileName(fileName);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: cleanName,
        resource_type: "image",
        format: "webp",
        timeout: 120000,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    if (typeof file.pipe === "function") {
      file.pipe(stream);
    } else {
      stream.end(file);
    }
  });
}

//
export function uploadSvgToCloudinary(fileBuffer, folder = "ulon", fileName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${fileName}.svg`,
        resource_type: "raw",
        timeout: 120000,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(fileBuffer);
  });
}

// // // // // // // // // // // // // // // //

function getPublicIdFromUrl(url) {
  if (!url.includes("/upload/")) {
    throw new Error(`filePath does not contain /upload/: ${url}`);
  }

  const afterUpload = url.split("/upload/")[1];
  const withoutQuery = afterUpload.split("?")[0];

  // убираем версию v123...
  const withoutVersion = withoutQuery.replace(/^v\d+\//, "");

  const decoded = decodeURIComponent(withoutVersion);
  // decoded: "ulon_projects/Rectangle (1).png.webp"

  // убираем .webp
  const noWebp = decoded.replace(/\.[^.]+$/, ""); // "ulon_projects/Rectangle (1).png"

  // убираем .png
  const publicId = noWebp.replace(/\.[^.]+$/, ""); // "ulon_projects/Rectangle (1)"

  return publicId;
}

export async function deleteFromCloudinary(image) {
  if (!image || !image.filePath) throw new Error("Не задан image или filePath");

  const url = image.filePath;
  const publicId = getPublicIdFromUrl(url);
  const resourceType = image.type === "VECTOR" ? "raw" : "image";

  console.log("<====publicId====>", publicId);
  console.log("<====resourceType====>", resourceType);

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("<====result====>", result);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}
