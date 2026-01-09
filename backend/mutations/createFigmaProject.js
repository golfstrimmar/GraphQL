import prisma from "../prisma/client.js";

const createFigmaProject = async (_, { ownerId, name, fileCache }) => {
  console.log("Creating FigmaProject...", ownerId, name);

  const exists = await prisma.figmaProject.findUnique({
    where: {
      ownerId_name: {
        ownerId: Number(ownerId),
        name,
      },
    },
  });
  if (exists) {
    throw new Error(
      `FigmaProject with name: ${(ownerId, name)} already exists`,
    );
  }

  try {
    const project = await prisma.figmaProject.create({
      data: {
        ownerId: Number(ownerId),
        name,
        fileCache,
        fileCacheUpdatedAt: new Date(),
      },
      include: { owner: true },
    });
    console.log("=== 🔹🔹🔹===FigmaProject created:", project);
    return project;
  } catch (error) {
    console.error("Failed to create FigmaProject:", error);
    throw new Error("Failed to create FigmaProject");
  }
};
export default createFigmaProject;
