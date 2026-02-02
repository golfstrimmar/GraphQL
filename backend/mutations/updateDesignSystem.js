import prisma from "../prisma/client.js";

const updateDesignSystem = async (_, { id, ownerId, designTexts }) => {
  if (!ownerId || !id) {
    throw new Error("ownerId and id are required");
  }

  const systemId = Number(id);
  const creatorId = Number(ownerId);

  // 1. Проверяем, что система существует и принадлежит ownerId
  const exists = await prisma.designSystem.findFirst({
    where: {
      id: systemId,
      creatorId,
    },
  });

  if (!exists) {
    throw new Error(`DesignSystem with id: ${id} does not exist`);
  }

  console.log("---designTexts---", designTexts);

  try {
    // 2. Чистим старые
    await prisma.designTexts.deleteMany({
      where: { designSystemId: systemId },
    });

    // 3. Обновляем систему и создаём новые записи
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
      },
      include: { creator: true, designTexts: true },
    });

    return designSystem;
  } catch (error) {
    console.error("=== 🚨🚨🚨 === Failed to update designSystem:", error);
    throw new Error("Failed to update designSystem");
  }
};

export default updateDesignSystem;
