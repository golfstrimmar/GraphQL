import prisma from "../prisma/client.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

async function removeDesignSystem(_, { id }) {
  const systemId = Number(id);

  // тянем систему вместе с картинками
  const system = await prisma.designSystem.findUnique({
    where: { id: systemId },
    include: { images: true },
  });

  if (!system) {
    throw new Error("Design System not found");
  }

  const images = system.images || [];

  // сначала пробуем удалить файлы из Cloudinary
  try {
    for (const img of images) {
      await deleteFromCloudinary({
        filePath: img.url,
      });
    }
  } catch (err) {
    console.error("Failed to delete some images from Cloudinary:", err);
  }

  await prisma.designImage.deleteMany({
    where: { designSystemId: systemId },
  });

  await prisma.designSystem.deleteMany({
    where: { id: systemId },
  });

  console.log(`Design System with ID ${id} has been removed.`);
  return id;
}

export default removeDesignSystem;
