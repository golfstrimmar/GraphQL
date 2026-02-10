const updateDesignSystem = async (_, { id, ownerId, designTexts, images }) => {
  if (!ownerId || !id) {
    throw new Error("ownerId and id are required");
  }

  const systemId = Number(id);
  const creatorId = Number(ownerId);

  const exists = await prisma.designSystem.findFirst({
    where: { id: systemId, creatorId },
  });

  if (!exists) {
    throw new Error(`DesignSystem with id: ${id} does not exist`);
  }

  try {
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
        images: images
          ? {
              create: images.map((img) => ({
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
