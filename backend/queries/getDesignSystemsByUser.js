import prisma from "../prisma/client.js";

const getDesignSystemsByUser = async (_, { userId }) => {
  console.log("===!!!!===userId", userId);
  if (!userId) throw new Error("Missing User Id");

  const systems = await prisma.designSystem.findMany({
    where: { creatorId: Number(userId) },
    include: {
      backgrounds: true,
      colors: true,
      fonts: true,
    },
  });
  return systems ?? [];
};

export default getDesignSystemsByUser;
