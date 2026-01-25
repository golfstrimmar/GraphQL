import prisma from "../prisma/client.js";

const createDesignSystem = async (
  _,
  { ownerId, name, backgrounds, colors, fonts, fontSizes },
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
        creator: true,
        backgrounds: true,
        colors: true,
        fonts: true,
        fontSizes: true,
      },
    });

    return designSystem;
  } catch (error) {
    console.error("=== 🚨🚨🚨 === Failed to create designSystem:", error);
    throw new Error("Failed to create designSystem");
  }
};

export default createDesignSystem;
