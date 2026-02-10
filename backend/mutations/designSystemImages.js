// resolvers/designSystemImages.js
import prisma from "../prisma/client.js";

/**
 * addDesignImagesToSystem
 * Добавляет новые картинки к существующей DesignSystem
 */
export const addDesignImagesToSystem = async (
  _,
  { designSystemId, images },
) => {
  const systemId = Number(designSystemId);

  const exists = await prisma.designSystem.findUnique({
    where: { id: systemId },
  });

  if (!exists) {
    throw new Error(`DesignSystem with id: ${designSystemId} does not exist`);
  }

  try {
    await prisma.designImage.createMany({
      data: images.map((img) => ({
        publicId: img.publicId,
        url: img.url,
        alt: img.alt ?? null,
        designSystemId: systemId,
      })),
    });

    const designSystem = await prisma.designSystem.findUnique({
      where: { id: systemId },
      include: {
        creator: true,
        designTexts: true,
        images: true,
      },
    });

    return designSystem;
  } catch (error) {
    console.error(
      "=== 🚨🚨🚨 === Failed to add images to designSystem:",
      error,
    );
    throw new Error("Failed to add images to designSystem");
  }
};

/**
 * updateDesignImages
 * Обновляет существующие картинки (сейчас — только alt по id)
 */
export const updateDesignImages = async (_, { designSystemId, images }) => {
  const systemId = Number(designSystemId);

  const exists = await prisma.designSystem.findUnique({
    where: { id: systemId },
  });

  if (!exists) {
    throw new Error(`DesignSystem with id: ${designSystemId} does not exist`);
  }

  try {
    // Обновляем по одной, т.к. createMany/updateMany не возвращают записи
    for (const img of images) {
      const imageId = Number(img.id);

      await prisma.designImage.updateMany({
        where: {
          id: imageId,
          designSystemId: systemId,
        },
        data: {
          alt: img.alt ?? null,
        },
      });
    }

    const designSystem = await prisma.designSystem.findUnique({
      where: { id: systemId },
      include: {
        creator: true,
        designTexts: true,
        images: true,
      },
    });

    return designSystem;
  } catch (error) {
    console.error("=== 🚨🚨🚨 === Failed to update design images:", error);
    throw new Error("Failed to update design images");
  }
};

/**
 * removeDesignImage
 * Удаляет одну картинку из DesignSystem
 */
export const removeDesignImage = async (_, { designSystemId, imageId }) => {
  const systemId = Number(designSystemId);
  const imgId = Number(imageId);

  const exists = await prisma.designSystem.findUnique({
    where: { id: systemId },
  });

  if (!exists) {
    throw new Error(`DesignSystem with id: ${designSystemId} does not exist`);
  }

  try {
    await prisma.designImage.deleteMany({
      where: {
        id: imgId,
        designSystemId: systemId,
      },
    });

    const designSystem = await prisma.designSystem.findUnique({
      where: { id: systemId },
      include: {
        creator: true,
        designTexts: true,
        images: true,
      },
    });

    return designSystem;
  } catch (error) {
    console.error("=== 🚨🚨🚨 === Failed to remove design image:", error);
    throw new Error("Failed to remove design image");
  }
};
