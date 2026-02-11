import prisma from "../prisma/client.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

const updateDesignSystem = async (_, { id, ownerId, designTexts, images }) => {
  if (!ownerId || !id) {
    throw new Error("ownerId and id are required");
  }

  const systemId = Number(id);
  const creatorId = Number(ownerId);

  const exists = await prisma.designSystem.findFirst({
    where: { id: systemId, creatorId },
    include: { images: true }, // важно: тянем старые картинки
  });

  if (!exists) {
    throw new Error(`DesignSystem with id: ${id} does not exist`);
  }

  // старые картинки из БД
  const oldImages = exists.images || [];

  // новый список — то, что пришло с клиента
  const newImages = images || [];

  // множества publicId
  const oldPublicIds = new Set(
    oldImages.map((img) => img.publicId).filter(Boolean),
  );
  const newPublicIds = new Set(
    newImages.map((img) => img.publicId).filter(Boolean),
  );

  // какие publicId были, но исчезли
  // какие publicId были, но исчезли
  const toDeleteOldImages = oldImages.filter(
    (old) => !newPublicIds.has(old.publicId),
  );

  // сначала пробуем удалить из Cloudinary по url
  try {
    for (const img of toDeleteOldImages) {
      await deleteFromCloudinary({
        filePath: img.url,
      });
    }
  } catch (err) {
    console.error("Failed to delete some images from Cloudinary:", err);
  }

  try {
    // чистим тексты и картинки в БД
    await prisma.designTexts.deleteMany({
      where: { designSystemId: systemId },
    });
    await prisma.designImage.deleteMany({
      where: { designSystemId: systemId },
    });

    const designSystem = await prisma.designSystem.update({
      where: { id: systemId },
      data: {
        creatorId,
        designTexts: {
          create: designTexts.map((fs) => ({
            tagText: fs.tagText,
            classText: fs.classText,
            styleText: fs.styleText,
          })),
        },
        images: newImages.length
          ? {
              create: newImages.map((img) => ({
                publicId: img.publicId,
                url: img.url,
                alt: img.alt ?? null,
              })),
            }
          : undefined,
      },
      include: {
        creator: true,
        designTexts: true,
        images: true,
      },
    });

    return designSystem;
  } catch (error) {
    console.error("=== 🚨🚨🚨 === Failed to update designSystem:", error);
    throw new Error("Failed to update designSystem");
  }
};
export default updateDesignSystem;
