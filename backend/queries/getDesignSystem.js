import prisma from "../prisma/client.js";

const getDesignSystem = async (_, { id }) => {
  if (!id) throw new Error("Missing System Id");

  let system = await prisma.designSystem.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      designTexts: true,
      images: true,
    },
  });

  if (!system) throw new Error("System not found");
  return system;
};

export default getDesignSystem;
