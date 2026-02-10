import prisma from "../prisma/client.js";

const getDesignSystemsByUser = async (_, { userId }) => {
  if (!userId) throw new Error("Missing User Id");

  const systems = await prisma.designSystem.findMany({
    where: { creatorId: Number(userId) },
    include: {
      designTexts: true,
      images: true,
    },
  });
  return systems ?? [];
};

export default getDesignSystemsByUser;
