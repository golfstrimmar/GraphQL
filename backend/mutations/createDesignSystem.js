import prisma from "../prisma/client.js";

const createDesignSystem = async (
  _,
  { ownerId, name, designTexts, images },
) => {
  if (!ownerId || !name) {
    throw new Error("Name and ownerId are required");
  }

  const exists = await prisma.designSystem.findUnique({
    where: {
      creatorId_name: {
        creatorId: Number(ownerId),
        name,
      },
    },
  });

  if (exists) {
    throw new Error(`DesignSystem with name: ${name} already exists`);
  }

  try {
    const designSystem = await prisma.designSystem.create({
      data: {
        creatorId: Number(ownerId),
        name,
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
    console.error("=== 🚨🚨🚨 === Failed to create designSystem:", error);
    throw new Error("Failed to create designSystem");
  }
};

export default createDesignSystem;
