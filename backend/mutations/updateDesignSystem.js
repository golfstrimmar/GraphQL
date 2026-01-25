import prisma from "../prisma/client.js";

const updateDesignSystem = async (
  _,
  { id, ownerId, backgrounds, colors, fonts, fontSizes },
) => {
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

  try {
    // 2. Чистим старые backgrounds/colors/fonts
    await prisma.background.deleteMany({
      where: { designSystemId: systemId },
    });

    await prisma.color.deleteMany({
      where: { designSystemId: systemId },
    });

    await prisma.font.deleteMany({
      where: { designSystemId: systemId },
    });

    await prisma.fontSize.deleteMany({
      where: { designSystemId: systemId },
    });

    // 3. Обновляем систему и создаём новые записи
    const designSystem = await prisma.designSystem.update({
      where: { id: systemId },
      data: {
        // creatorId менять обычно не нужно, но можно оставить, если надо
        creatorId,
        backgrounds: {
          create: backgrounds.map((b) => ({
            background: b.background,
            value: b.value,
          })),
        },
        colors: {
          create: colors.map((c) => ({
            color: c.color,
            value: c.value,
          })),
        },
        fonts: {
          create: fonts.map((f) => ({
            font: f.font,
            value: f.value,
          })),
        },
        fontSizes: {
          create: fontSizes.map((fs) => ({
            fontSize: fs.fontSize,
            value: fs.value,
          })),
        },
      },
      include: {
        backgrounds: true,
        colors: true,
        fonts: true,
        fontSizes: true,
        creator: true,
      },
    });

    return designSystem;
  } catch (error) {
    console.error("=== 🚨🚨🚨 === Failed to update designSystem:", error);
    throw new Error("Failed to update designSystem");
  }
};

export default updateDesignSystem;
